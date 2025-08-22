'use client'
import {useBlocklyWorkspace} from "react-blockly"
import '@/service/blocks/blocks'
import {useCallback, useEffect, useRef, useState} from "react";
import {UseBlocklyProps} from "react-blockly/dist/BlocklyWorkspaceProps";
import { EditorView } from '@codemirror/view'
import dynamic from "next/dynamic";
import * as Blockly from "blockly";
import {useSearchParams} from "next/navigation";
import {crystalGenerator} from "@/service/crystal/crystal";


const ReactCodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

const Home = () => {
  const searchParams = useSearchParams()
  const ref = useRef<HTMLDivElement | null>(null)
  const xmlBase64 = searchParams.get('xmlBase64') || '';
  const initialXml = xmlBase64 != undefined ?
    atob(decodeURIComponent(xmlBase64)) : "{}"

  useEffect(() => {
    console.log(initialXml)
  }, [initialXml])

  const {workspace: ws, json, xml} = useBlocklyWorkspace({
    ref: ref,
    initialXml: initialXml,
    toolboxConfiguration: MY_TOOLBOX,
    workspaceConfiguration: {
      horizontalLayout: true,
      sounds: false,
      theme: {
        ...Blockly.Themes.Zelos,
        componentStyles: {
          ...Blockly.Themes.Zelos.componentStyles,
          // https://colorhunt.co/palette/222831393e46948979dfd0b8
          workspaceBackgroundColour: '#dfd0b8',
          toolboxBackgroundColour: '#222831',
        },
      },
    },
    // WARN: fix type
  } as UseBlocklyProps)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [code, setCode] = useState('')

  useEffect(() => {
    console.log(json, xml)
  }, [json, xml])

  const openDrawerAndGenerate = useCallback(() => {
    if (!ws) return
    const generated = crystalGenerator.workspaceToCode(ws)
    setCode(generated)
    setDrawerOpen(true);
  }, [ws]);

  const copy = useCallback(() => {
    if (!code) return;
    navigator.clipboard.writeText(code);
  }, [code]);

  const exportUrlCopy = () => {
    const xmlBase64 = encodeURIComponent(btoa(xml || ''));
    const url = `${location.origin}${location.pathname}?xmlBase64=${xmlBase64}`;
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="h-dvh flex flex-col">
      <header className="p-2 flex justify-between border-b">
        Ruby Block Editor
        <div className="flex gap-4">
          <button className="rounded-lg bg-blue-800 px-4" onClick={() => openDrawerAndGenerate()}>
            Gen Ruby
          </button>
          <button className="rounded-lg bg-blue-800 px-4" onClick={() => exportUrlCopy()}>
            Export
          </button>
        </div>
      </header>
      <div className="flex-1 z-0">
        <div ref={ref} className="w-full h-full" />
      </div>
      {/* 全画面 Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="p-2 flex items-center justify-between border-b bg-black"
               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom)/4)' }}>
            <span>Ruby コード</span>
            <div className="space-x-2">
              <button onClick={copy}>コピー</button>
              <button onClick={() => setDrawerOpen(false)}>閉じる</button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {/* CodeMirror 本体（読み取り専用 + 折り返し） */}
            <ReactCodeMirror
              value={code}
              className="h-full bg-gray-100 text-gray-800"
              extensions={[
                EditorView.editable.of(false),
                EditorView.lineWrapping
              ]}
              basicSetup={{
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
                foldGutter: true,
                lineNumbers: true,
              }}
              readOnly
              theme={undefined /* システムに合わせたい場合は自前で切替 */}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// preset blocks list https://github.com/google/blockly/tree/develop/blocks
const MY_TOOLBOX = `
<xml>
  <category name="IO">
    <block type="io_read_line"/>
    <block type="io_read_number"/>
    <block type="io_read_numbers"/>
    <block type="io_puts"/>
  </category>
<!--  <category name="リテラル">-->
<!--    <block type="text"/>-->
<!--    <block type="math_number"/>-->
<!--  </category>-->
<!--  <category name="変数/演算">-->
<!--    <block type="variables_set"/>-->
<!--    <block type="variables_get"/>-->
<!--    <block type="math_arithmetic"/>-->
<!--    <block type="get_index"/>-->
<!--    <block type="slice"/>-->
<!--    <block type="call_method"/>-->
<!--    <block type="logic_compare"/>-->
<!--    <block type="text_join"/>-->
<!--  </category>-->
<!--  <category name="制御">-->
<!--    <block type="controls_if"/>-->
<!--    <block type="logic_compare"/>-->
<!--    <block type="times"/>-->
<!--  </category>-->
</xml>
`

export default Home;