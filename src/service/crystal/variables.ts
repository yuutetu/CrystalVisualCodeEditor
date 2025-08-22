import * as Blockly from 'blockly/core'
import {CRYSTAL_ORDER, CrystalGenerator} from "@/service/crystal/crystal";

export const variables_set = (
  block: Blockly.Block,
  generator: CrystalGenerator,
) => {
  // Variable setter.
  const argument0 = generator.valueToCode(block, 'VALUE', CRYSTAL_ORDER.NONE) || '0';
  const varName = generator.getVariableName(block.getFieldValue('VAR'));
  return varName + ' = ' + argument0 + '\n';
}

export const variables_get = (
  block: Blockly.Block,
  generator: CrystalGenerator,
): [string, number] => {
  // Variable getter.
  const varName = generator.getVariableName(block.getFieldValue('VAR'));
  return [varName, CRYSTAL_ORDER.ATOMIC];
}

export const generators = {
  variables_set,
  variables_get,
}