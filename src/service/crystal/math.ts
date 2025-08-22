import * as Blockly from 'blockly/core'
import {CRYSTAL_ORDER, CrystalGenerator} from "@/service/crystal/crystal";

const math_number = (block: Blockly.Block): [string, number] => {
  // Numeric value.
  const code = block.getFieldValue('NUM') || '0';
  return [code, CRYSTAL_ORDER.ATOMIC];
}

const math_arithmetic = (block: Blockly.Block, generator: CrystalGenerator): [string, number] => {
  // Arithmetic operations.
  const OPERATORS: Record<string, [string, number]> = {
    ADD: ['+', CRYSTAL_ORDER.ADDITIVE],
    MINUS: ['-', CRYSTAL_ORDER.ADDITIVE],
    MULTIPLY: ['*', CRYSTAL_ORDER.MULTIPLICATIVE],
    DIVIDE: ['/', CRYSTAL_ORDER.MULTIPLICATIVE],
    POWER: ['**', CRYSTAL_ORDER.EXPONENTIATION],
  }

  const operator = OPERATORS[block.getFieldValue('OP')];
  const argument0 = generator.valueToCode(block, 'A', operator[1]) || '0';
  const argument1 = generator.valueToCode(block, 'B', operator[1]) || '0';
  return [`${argument0} ${operator[0]} ${argument1}`, operator[1]];
}

export const generators = {
  math_number,
  math_arithmetic,
}