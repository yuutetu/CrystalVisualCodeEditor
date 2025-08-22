import * as Blockly from 'blockly/core'
import {CRYSTAL_ORDER, CrystalGenerator} from "@/service/crystal/crystal";

export const text = (block: Blockly.Block, generator: CrystalGenerator): [string, number] => {
  // Text block.
  const text = block.getFieldValue('TEXT') || '';
  return [generator.quote_(text), CRYSTAL_ORDER.ATOMIC];
}

export const get_index = (
  block: Blockly.Block,
  generator: CrystalGenerator,
): [string, number] => {
  // Get element from array by index.
  const array = generator.valueToCode(block, 'Array', CRYSTAL_ORDER.MEMBER) || '[]';
  const index = generator.valueToCode(block, 'Index', CRYSTAL_ORDER.ATOMIC) || '0';
  return [`${array}[${index}]`, CRYSTAL_ORDER.MEMBER];
}

export const slice = (
  block: Blockly.Block,
  generator: CrystalGenerator,
): [string, number] => {
  // Get slice from string.
  const string = generator.valueToCode(block, 'String', CRYSTAL_ORDER.MEMBER) || '""';
  const start = generator.valueToCode(block, 'Index', CRYSTAL_ORDER.ATOMIC) || '0';
  const count = generator.valueToCode(block, 'Count', CRYSTAL_ORDER.ATOMIC) || '0';
  return [`${string}[${start},${count}]`, CRYSTAL_ORDER.MEMBER];
}

export const generators = {
  text,
  slice,
  get_index,
}