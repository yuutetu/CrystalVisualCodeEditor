import * as Blockly from 'blockly/core'
import {CRYSTAL_ORDER, CrystalGenerator} from "./crystal";

const io_read_line = (): [string, number] => {
  return ["gets.not_nil!.chomp", CRYSTAL_ORDER.ATOMIC]
}

const io_read_number = (): [string, number] => {
  // In Ruby, you can read a number from input and convert it to an integer.
  return ["gets.not_nil!.to_i64", CRYSTAL_ORDER.ATOMIC]
}

const io_puts = (
  block: Blockly.Block,
  generator: CrystalGenerator,
): string => {
  const argument0 = generator.valueToCode(block, 'VALUE', CRYSTAL_ORDER.NONE) || '""';
  return `puts ${argument0}`
}

const io_read_numbers = (): [string, number] => {
  // This is a placeholder for reading multiple numbers from input.
  // In Ruby, you might read a line and split it into numbers.
  return ["gets.not_nil!.split.map(&.to_i64)", CRYSTAL_ORDER.ATOMIC]
}

export const generators = {
  io_read_line,
  io_read_number,
  io_puts,
  io_read_numbers,
}