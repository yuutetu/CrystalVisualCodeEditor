import * as Blockly from 'blockly/core'
import {CRYSTAL_ORDER, CrystalGenerator} from "@/service/crystal/crystal";

export const controls_if = (
  block: Blockly.Block,
  generator: CrystalGenerator,
): string => {
  // If statement.
  const condition = generator.valueToCode(block, 'IF0', CRYSTAL_ORDER.NONE) || 'false';
  const branch = generator.statementToCode(block, 'DO0') || '';
  let code = `if ${condition}\n${branch}`;

  // else if branches
  let n = 1;
  while (block.getInput(`IF${n}`)) {
    const elseCondition = generator.valueToCode(block, `IF${n}`, CRYSTAL_ORDER.NONE) || 'false';
    const elseBranch = generator.statementToCode(block, `DO${n}`) || '';
    code += `\nelsif ${elseCondition}\n${elseBranch}`;
    n++;
  }

  if (block.getInput('ELSE')) {
    const elseBranch = generator.statementToCode(block, 'ELSE');
    code += `\nelse\n${elseBranch}`;
  }
  code += '\nend\n';
  return code;
}

export const logic_compare = (
  block: Blockly.Block,
  generator: CrystalGenerator,
): [string, number] => {
  // Comparison operator.
  const OPERATORS: Record<string, string> = {
    EQ: '==',
    NEQ: '!=',
    LT: '<',
    LTE: '<=',
    GT: '>',
    GTE: '>=',
  };
  const operator = OPERATORS[block.getFieldValue('OP')];
  const argument0 = generator.valueToCode(block, 'A', CRYSTAL_ORDER.RELATIONAL) || '0';
  const argument1 = generator.valueToCode(block, 'B', CRYSTAL_ORDER.RELATIONAL) || '0';
  return [`${argument0} ${operator} ${argument1}`, CRYSTAL_ORDER.RELATIONAL];
}

const call_method = (
  block: Blockly.Block,
  generator: CrystalGenerator,
): [string, number] => {
  // Call a number method on an object.
  const object = generator.valueToCode(block, 'Object', CRYSTAL_ORDER.ATOMIC) || 'nil';
  const method = block.getFieldValue('Method') || '';
  const args = generator.valueToCode(block, 'Args', CRYSTAL_ORDER.NONE) || '';
  return [`${object}.${method}(${args})`, CRYSTAL_ORDER.FUNCTION_CALL];
}

const times = (
  block: Blockly.Block,
  generator: CrystalGenerator,
): string => {
  // Loop a specific number of times.
  const times = generator.valueToCode(block, 'TIMES', CRYSTAL_ORDER.ATOMIC) || '0';
  const branch = generator.statementToCode(block, 'DO') || '';
  return `${times}.times do\n${branch}end\n`;
}

export const generators = {
  controls_if,
  logic_compare,
  call_method,
  times,
}