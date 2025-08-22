import * as Blockly from 'blockly/core'
import { Block, CodeGenerator } from 'blockly/core'
import * as io from './io'
import * as logic from './logic'
import * as math from './math'

/**
 * Crystal code generator
 */
export class CrystalGenerator extends CodeGenerator {
  getReservedWords() {
    return this.RESERVED_WORDS_
  }

  getDefinitions() {
    return this.definitions_ || {}
  }

  setDefinitions(definitions: Record<string, string>) {
    this.definitions_ = definitions
  }

  setFunctionNames(functionNames: Record<string, string>) {
    this.functionNames_ = functionNames
  }

  resetNameDB() {
    if (this.nameDB_) this.nameDB_.reset()
  }

  // 引用符処理（Crystal は基本 Ruby と同様のエスケープ）
  quote_(s: string) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
}

// Crystal 用 Generator インスタンス
export const crystalGenerator = new CrystalGenerator('Crystal')

/**
 * Crystal の演算子優先順位
 * 参考: Ruby と近いが、ビット演算やユニオン/型注釈など Crystal 特有の構文もある。
 * Blockly 上では値コンテキストの比較に使うため、必要十分な粒度で定義。
 */
export const CRYSTAL_ORDER = {
  ATOMIC: 0,             // リテラル、識別子
  MEMBER: 2,             // .  []
  FUNCTION_CALL: 2,      // ()
  EXPONENTIATION: 3,     // ** （Crystal も右結合）
  LOGICAL_NOT: 4,        // !（単項）
  UNARY_SIGN: 4,         // + -
  BITWISE_NOT: 4,        // ~
  MULTIPLICATIVE: 5,     // * / % (// は Crystal にはない)
  ADDITIVE: 6,           // + -
  BITWISE_SHIFT: 7,      // << >>
  BITWISE_AND: 8,        // &
  BITWISE_XOR: 9,        // ^
  BITWISE_OR: 10,        // |
  RELATIONAL: 11,        // < <= > >= != == === =~ !~ <=> (一部は必要に応じて)
  LOGICAL_AND: 13,       // &&
  LOGICAL_OR: 14,        // ||
  CONDITIONAL: 15,       // if/unless/while/until 後置
  NONE: 99,              // カッコなどで優先
} as const

export type CrystalOrder = typeof CRYSTAL_ORDER[keyof typeof CRYSTAL_ORDER]

// 予約語（Crystal 公式ドキュメント準拠 + よく使う擬似変数/擬似メソッド）
const CRYSTAL_RESERVED_WORDS = [
  // キーワード
  'abstract', 'alias', 'as', 'asm', 'begin', 'break', 'case', 'class', 'def',
  'do', 'else', 'elsif', 'end', 'ensure', 'enum', 'extend', 'for', 'fun',
  'if', 'include', 'instance_sizeof', 'is_a?', 'lib', 'macro', 'module', 'next',
  'nil', 'nil?', 'of', 'out', 'pointerof', 'private', 'protected', 'require',
  'rescue', 'responds_to?', 'return', 'select', 'self', 'sizeof', 'struct',
  'super', 'then', 'true', 'false', 'type', 'typeof', 'uninitialized', 'union',
  'unless', 'until', 'when', 'while', 'with', 'yield',

  // 擬似変数/定数的
  '__FILE__', '__LINE__',

  // 組込クラス/モジュール名（衝突しやすい代表のみ）
  'Array', 'Hash', 'String', 'Int32', 'Int64', 'Float32', 'Float64',
  'Bool', 'Symbol', 'Nil', 'Proc', 'Pointer', 'IO', 'File', 'Time', 'Tuple',

  // 演算子メソッド名など（変数名としては避ける）
  'and', 'or', 'not',
].join(',')

// 初期化（変数名管理など）
crystalGenerator.init = (workspace) => {
  // Blockly の Names に Crystal の予約語を渡して重複回避
  crystalGenerator.nameDB_ = new Blockly.Names(CRYSTAL_RESERVED_WORDS)
  crystalGenerator.nameDB_.setVariableMap(workspace.getVariableMap())
  crystalGenerator.setDefinitions(Object.create(null))
  crystalGenerator.setFunctionNames(Object.create(null))
}

// 終了処理（require などを先頭にまとめる）
crystalGenerator.finish = (code: string) => {
  const requires = Object.values(crystalGenerator.getDefinitions() || {}).join('\n')
  crystalGenerator.resetNameDB()
  return [requires, code].filter(Boolean).join('\n\n')
}

// コメントや次ブロックの接続処理（Ruby 版と同様で OK）
crystalGenerator.scrub_ = (block: Block, code: string) => {
  const comment = block.getCommentText()
  const commentCode = comment ? crystalGenerator.prefixLines(`# ${comment}`, '') : ''
  const nextBlock = block.nextConnection?.targetBlock()
  const nextCode = nextBlock ? crystalGenerator.blockToCode(nextBlock) : ''
  return commentCode + code + nextCode
}

// 各カテゴリの block generator を束ねて登録
const generators = {
  ...io.generators,
  // ...variables.generators,
  // ...string.generators,
  ...logic.generators,
  ...math.generators,
  // ...array.generators,
} satisfies Record<
  string,
  (block: Block, generator: CrystalGenerator) => string | [string, number] | null | (() => string | [string, number] | null)
>

for (const [name, fn] of Object.entries(generators)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crystalGenerator.forBlock[name] = fn as any
}