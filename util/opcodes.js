'use strict';

var _ = require('underscore')
  , util = require('util');

// http://map.grauw.nl/resources/z80instr.php
var insts = [
      {inst:"ADC A,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"8E"},
      {inst:"ADC A,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 8E oo"},
      {inst:"ADC A,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 8E oo"},
      {inst:"ADC A,n", z80Timing:"7", r800Timing:"2", opcodes:"CE nn"},
      {inst:"ADC A,r", z80Timing:"4", r800Timing:"1", opcodes:"88+r"},
      {inst:"ADC A,IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 88+p"},
      {inst:"ADC A,IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 88+q"},
      {inst:"ADC HL,BC", z80Timing:"15", r800Timing:"2", opcodes:"ED 4A"},
      {inst:"ADC HL,DE", z80Timing:"15", r800Timing:"2", opcodes:"ED 5A"},
      {inst:"ADC HL,HL", z80Timing:"15", r800Timing:"2", opcodes:"ED 6A"},
      {inst:"ADC HL,SP", z80Timing:"15", r800Timing:"2", opcodes:"ED 7A"},
      {inst:"ADD A,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"86"},
      {inst:"ADD A,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 86 oo"},
      {inst:"ADD A,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 86 oo"},
      {inst:"ADD A,n", z80Timing:"7", r800Timing:"2", opcodes:"C6 nn"},
      {inst:"ADD A,r", z80Timing:"4", r800Timing:"1", opcodes:"80+r"},
      {inst:"ADD A,IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 80+p"},
      {inst:"ADD A,IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 80+q"},
      {inst:"ADD HL,BC", z80Timing:"11", r800Timing:"1", opcodes:"09"},
      {inst:"ADD HL,DE", z80Timing:"11", r800Timing:"1", opcodes:"19"},
      {inst:"ADD HL,HL", z80Timing:"11", r800Timing:"1", opcodes:"29"},
      {inst:"ADD HL,SP", z80Timing:"11", r800Timing:"1", opcodes:"39"},
      {inst:"ADD IX,BC", z80Timing:"15", r800Timing:"2", opcodes:"DD 09"},
      {inst:"ADD IX,DE", z80Timing:"15", r800Timing:"2", opcodes:"DD 19"},
      {inst:"ADD IX,IX", z80Timing:"15", r800Timing:"2", opcodes:"DD 29"},
      {inst:"ADD IX,SP", z80Timing:"15", r800Timing:"2", opcodes:"DD 39"},
      {inst:"ADD IY,BC", z80Timing:"15", r800Timing:"2", opcodes:"FD 09"},
      {inst:"ADD IY,DE", z80Timing:"15", r800Timing:"2", opcodes:"FD 19"},
      {inst:"ADD IY,IY", z80Timing:"15", r800Timing:"2", opcodes:"FD 29"},
      {inst:"ADD IY,SP", z80Timing:"15", r800Timing:"2", opcodes:"FD 39"},
      {inst:"AND (HL)", z80Timing:"7", r800Timing:"2", opcodes:"A6"},
      {inst:"AND (IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD A6 oo"},
      {inst:"AND (IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD A6 oo"},
      {inst:"AND n", z80Timing:"7", r800Timing:"2", opcodes:"E6 nn"},
      {inst:"AND r", z80Timing:"4", r800Timing:"1", opcodes:"A0+r"},
      {inst:"AND IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD A0+p"},
      {inst:"AND IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD A0+q"},
      {inst:"BIT b,(HL)", z80Timing:"12", r800Timing:"3", opcodes:"CB 46+8*b"},
      {inst:"BIT b,(IX+o)", z80Timing:"20", r800Timing:"5", opcodes:"DD CB oo 46+8*b"},
      {inst:"BIT b,(IY+o)", z80Timing:"20", r800Timing:"5", opcodes:"FD CB oo 46+8*b"},
      {inst:"BIT b,r", z80Timing:"8", r800Timing:"2", opcodes:"CB 40+8*b+r"},
      {inst:"CALL nn", z80Timing:"17", r800Timing:"5", opcodes:"CD nn nn"},
      {inst:"CALL C,nn", z80Timing:"17/10", r800Timing:"5/3", opcodes:"DC nn nn"},
      {inst:"CALL M,nn", z80Timing:"17/10", r800Timing:"5/3", opcodes:"FC nn nn"},
      {inst:"CALL NC,nn", z80Timing:"17/10", r800Timing:"5/3", opcodes:"D4 nn nn"},
      {inst:"CALL NZ,nn", z80Timing:"17/10", r800Timing:"5/3", opcodes:"C4 nn nn"},
      {inst:"CALL P,nn", z80Timing:"17/10", r800Timing:"5/3", opcodes:"F4 nn nn"},
      {inst:"CALL PE,nn", z80Timing:"17/10", r800Timing:"5/3", opcodes:"EC nn nn"},
      {inst:"CALL PO,nn", z80Timing:"17/10", r800Timing:"5/3", opcodes:"E4 nn nn"},
      {inst:"CALL Z,nn", z80Timing:"17/10", r800Timing:"5/3", opcodes:"CC nn nn"},
      {inst:"CCF", z80Timing:"4", r800Timing:"1", opcodes:"3F"},
      {inst:"CP (HL)", z80Timing:"7", r800Timing:"2", opcodes:"BE"},
      {inst:"CP (IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD BE oo"},
      {inst:"CP (IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD BE oo"},
      {inst:"CP n", z80Timing:"7", r800Timing:"2", opcodes:"FE nn"},
      {inst:"CP r", z80Timing:"4", r800Timing:"1", opcodes:"B8+r"},
      {inst:"CP IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD B8+p"},
      {inst:"CP IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD B8+q"},
      {inst:"CPD", z80Timing:"16", r800Timing:"4", opcodes:"ED A9"},
      {inst:"CPDR", z80Timing:"21/16", r800Timing:"4", opcodes:"ED B9"},
      {inst:"CPI", z80Timing:"16", r800Timing:"4", opcodes:"ED A1"},
      {inst:"CPIR", z80Timing:"21/16", r800Timing:"4", opcodes:"ED B1"},
      {inst:"CPL", z80Timing:"4", r800Timing:"1", opcodes:"2F"},
      {inst:"DAA", z80Timing:"4", r800Timing:"1", opcodes:"27"},
      {inst:"DEC (HL)", z80Timing:"11", r800Timing:"4", opcodes:"35"},
      {inst:"DEC (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD 35 oo"},
      {inst:"DEC (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD 35 oo"},
      {inst:"DEC A", z80Timing:"4", r800Timing:"1", opcodes:"3D"},
      {inst:"DEC B", z80Timing:"4", r800Timing:"1", opcodes:"05"},
      {inst:"DEC BC", z80Timing:"6", r800Timing:"1", opcodes:"0B"},
      {inst:"DEC C", z80Timing:"4", r800Timing:"1", opcodes:"0D"},
      {inst:"DEC D", z80Timing:"4", r800Timing:"1", opcodes:"15"},
      {inst:"DEC DE", z80Timing:"6", r800Timing:"1", opcodes:"1B"},
      {inst:"DEC E", z80Timing:"4", r800Timing:"1", opcodes:"1D"},
      {inst:"DEC H", z80Timing:"4", r800Timing:"1", opcodes:"25"},
      {inst:"DEC HL", z80Timing:"6", r800Timing:"1", opcodes:"2B"},
      {inst:"DEC IX", z80Timing:"10", r800Timing:"2", opcodes:"DD 2B"},
      {inst:"DEC IY", z80Timing:"10", r800Timing:"2", opcodes:"FD 2B"},
      {inst:"DEC IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 05+8*p"},
      {inst:"DEC IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 05+8*q"},
      {inst:"DEC L", z80Timing:"4", r800Timing:"1", opcodes:"2D"},
      {inst:"DEC SP", z80Timing:"6", r800Timing:"1", opcodes:"3B"},
      {inst:"DI", z80Timing:"4", r800Timing:"2", opcodes:"F3"},
      {inst:"DJNZ o", z80Timing:"13/8", r800Timing:"2", opcodes:"10 oo"},
      {inst:"EI", z80Timing:"4", r800Timing:"1", opcodes:"FB"},
      {inst:"EX (SP),HL", z80Timing:"19", r800Timing:"5", opcodes:"E3"},
      {inst:"EX (SP),IX", z80Timing:"23", r800Timing:"6", opcodes:"DD E3"},
      {inst:"EX (SP),IY", z80Timing:"23", r800Timing:"6", opcodes:"FD E3"},
      {inst:"EX AF,AF'", z80Timing:"4", r800Timing:"1", opcodes:"08"},
      {inst:"EX DE,HL", z80Timing:"4", r800Timing:"1", opcodes:"EB"},
      {inst:"EXX", z80Timing:"4", r800Timing:"1", opcodes:"D9"},
      {inst:"HALT", z80Timing:"4", r800Timing:"2", opcodes:"76"},
      {inst:"IM 0", z80Timing:"8", r800Timing:"3", opcodes:"ED 46"},
      {inst:"IM 1", z80Timing:"8", r800Timing:"3", opcodes:"ED 56"},
      {inst:"IM 2", z80Timing:"8", r800Timing:"3", opcodes:"ED 5E"},
      {inst:"IN A,(C)", z80Timing:"12", r800Timing:"3", opcodes:"ED 78"},
      {inst:"IN A,(n)", z80Timing:"11", r800Timing:"3", opcodes:"DB nn"},
      {inst:"IN B,(C)", z80Timing:"12", r800Timing:"3", opcodes:"ED 40"},
      {inst:"IN C,(C)", z80Timing:"12", r800Timing:"3", opcodes:"ED 48"},
      {inst:"IN D,(C)", z80Timing:"12", r800Timing:"3", opcodes:"ED 50"},
      {inst:"IN E,(C)", z80Timing:"12", r800Timing:"3", opcodes:"ED 58"},
      {inst:"IN H,(C)", z80Timing:"12", r800Timing:"3", opcodes:"ED 60"},
      {inst:"IN L,(C)", z80Timing:"12", r800Timing:"3", opcodes:"ED 68"},
      {inst:"IN F,(C)", z80Timing:"12", r800Timing:"3", opcodes:"ED 70"},
      {inst:"INC (HL)", z80Timing:"11", r800Timing:"4", opcodes:"34"},
      {inst:"INC (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD 34 oo"},
      {inst:"INC (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD 34 oo"},
      {inst:"INC A", z80Timing:"4", r800Timing:"1", opcodes:"3C"},
      {inst:"INC B", z80Timing:"4", r800Timing:"1", opcodes:"04"},
      {inst:"INC BC", z80Timing:"6", r800Timing:"1", opcodes:"03"},
      {inst:"INC C", z80Timing:"4", r800Timing:"1", opcodes:"0C"},
      {inst:"INC D", z80Timing:"4", r800Timing:"1", opcodes:"14"},
      {inst:"INC DE", z80Timing:"6", r800Timing:"1", opcodes:"13"},
      {inst:"INC E", z80Timing:"4", r800Timing:"1", opcodes:"1C"},
      {inst:"INC H", z80Timing:"4", r800Timing:"1", opcodes:"24"},
      {inst:"INC HL", z80Timing:"6", r800Timing:"1", opcodes:"23"},
      {inst:"INC IX", z80Timing:"10", r800Timing:"2", opcodes:"DD 23"},
      {inst:"INC IY", z80Timing:"10", r800Timing:"2", opcodes:"FD 23"},
      {inst:"INC IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 04+8*p"},
      {inst:"INC IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 04+8*q"},
      {inst:"INC L", z80Timing:"4", r800Timing:"1", opcodes:"2C"},
      {inst:"INC SP", z80Timing:"6", r800Timing:"1", opcodes:"33"},
      {inst:"IND", z80Timing:"16", r800Timing:"4", opcodes:"ED AA"},
      {inst:"INDR", z80Timing:"21/16", r800Timing:"4/3", opcodes:"ED BA"},
      {inst:"INI", z80Timing:"16", r800Timing:"4", opcodes:"ED A2"},
      {inst:"INIR", z80Timing:"21/16", r800Timing:"4/3", opcodes:"ED B2"},
      {inst:"JP nn", z80Timing:"10", r800Timing:"3", opcodes:"C3 nn nn"},
      {inst:"JP (HL)", z80Timing:"4", r800Timing:"1", opcodes:"E9"},
      {inst:"JP (IX)", z80Timing:"8", r800Timing:"2", opcodes:"DD E9"},
      {inst:"JP (IY)", z80Timing:"8", r800Timing:"2", opcodes:"FD E9"},
      {inst:"JP C,nn", z80Timing:"10", r800Timing:"3", opcodes:"DA nn nn"},
      {inst:"JP M,nn", z80Timing:"10", r800Timing:"3", opcodes:"FA nn nn"},
      {inst:"JP NC,nn", z80Timing:"10", r800Timing:"3", opcodes:"D2 nn nn"},
      {inst:"JP NZ,nn", z80Timing:"10", r800Timing:"3", opcodes:"C2 nn nn"},
      {inst:"JP P,nn", z80Timing:"10", r800Timing:"3", opcodes:"F2 nn nn"},
      {inst:"JP PE,nn", z80Timing:"10", r800Timing:"3", opcodes:"EA nn nn"},
      {inst:"JP PO,nn", z80Timing:"10", r800Timing:"3", opcodes:"E2 nn nn"},
      {inst:"JP Z,nn", z80Timing:"10", r800Timing:"3", opcodes:"CA nn nn"},
      {inst:"JR o", z80Timing:"12", r800Timing:"3", opcodes:"18 oo"},
      {inst:"JR C,o", z80Timing:"12/7", r800Timing:"3/2", opcodes:"38 oo"},
      {inst:"JR NC,o", z80Timing:"12/7", r800Timing:"3/2", opcodes:"30 oo"},
      {inst:"JR NZ,o", z80Timing:"12/7", r800Timing:"3/2", opcodes:"20 oo"},
      {inst:"JR Z,o", z80Timing:"12/7", r800Timing:"3/2", opcodes:"28 oo"},
      {inst:"LD (BC),A", z80Timing:"7", r800Timing:"2", opcodes:"02"},
      {inst:"LD (DE),A", z80Timing:"7", r800Timing:"2", opcodes:"12"},
      {inst:"LD (HL),n", z80Timing:"10", r800Timing:"3", opcodes:"36 nn"},
      {inst:"LD (HL),r", z80Timing:"7", r800Timing:"2", opcodes:"70+r"},
      {inst:"LD (IX+o),n", z80Timing:"19", r800Timing:"5", opcodes:"DD 36 oo nn"},
      {inst:"LD (IX+o),r", z80Timing:"19", r800Timing:"5", opcodes:"DD 70+r oo"},
      {inst:"LD (IY+o),n", z80Timing:"19", r800Timing:"5", opcodes:"FD 36 oo nn"},
      {inst:"LD (IY+o),r", z80Timing:"19", r800Timing:"5", opcodes:"FD 70+r oo"},
      {inst:"LD (nn),A", z80Timing:"13", r800Timing:"4", opcodes:"32 nn nn"},
      {inst:"LD (nn),BC", z80Timing:"20", r800Timing:"6", opcodes:"ED 43 nn nn"},
      {inst:"LD (nn),DE", z80Timing:"20", r800Timing:"6", opcodes:"ED 53 nn nn"},
      {inst:"LD (nn),HL", z80Timing:"16", r800Timing:"5", opcodes:"22 nn nn"},
      {inst:"LD (nn),IX", z80Timing:"20", r800Timing:"6", opcodes:"DD 22 nn nn"},
      {inst:"LD (nn),IY", z80Timing:"20", r800Timing:"6", opcodes:"FD 22 nn nn"},
      {inst:"LD (nn),SP", z80Timing:"20", r800Timing:"6", opcodes:"ED 73 nn nn"},
      {inst:"LD A,(BC)", z80Timing:"7", r800Timing:"2", opcodes:"0A"},
      {inst:"LD A,(DE)", z80Timing:"7", r800Timing:"2", opcodes:"1A"},
      {inst:"LD A,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"7E"},
      {inst:"LD A,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 7E oo"},
      {inst:"LD A,(IY+o)", z80Timing:"19", r800Timing:"1", opcodes:"FD 7E oo"},
      {inst:"LD A,(nn)", z80Timing:"13", r800Timing:"4", opcodes:"3A nn nn"},
      {inst:"LD A,n", z80Timing:"7", r800Timing:"2", opcodes:"3E nn"},
      {inst:"LD A,r", z80Timing:"4", r800Timing:"1", opcodes:"78+r"},
      {inst:"LD A,IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 78+p"},
      {inst:"LD A,IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 78+q"},
      {inst:"LD A,I", z80Timing:"9", r800Timing:"2", opcodes:"ED 57"},
      {inst:"LD A,R", z80Timing:"9", r800Timing:"2", opcodes:"ED 5F"},
      {inst:"LD B,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"46"},
      {inst:"LD B,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 46 oo"},
      {inst:"LD B,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 46 oo"},
      {inst:"LD B,n", z80Timing:"7", r800Timing:"2", opcodes:"06 nn"},
      {inst:"LD B,r", z80Timing:"4", r800Timing:"1", opcodes:"40+r"},
      {inst:"LD B,IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 40+p"},
      {inst:"LD B,IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 40+q"},
      {inst:"LD BC,(nn)", z80Timing:"20", r800Timing:"6", opcodes:"ED 4B nn nn"},
      {inst:"LD BC,nn", z80Timing:"10", r800Timing:"3", opcodes:"01 nn nn"},
      {inst:"LD C,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"4E"},
      {inst:"LD C,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 4E oo"},
      {inst:"LD C,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 4E oo"},
      {inst:"LD C,n", z80Timing:"7", r800Timing:"2", opcodes:"0E nn"},
      {inst:"LD C,r", z80Timing:"4", r800Timing:"1", opcodes:"48+r"},
      {inst:"LD C,IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 48+p"},
      {inst:"LD C,IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 48+q"},
      {inst:"LD D,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"56"},
      {inst:"LD D,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 56 oo"},
      {inst:"LD D,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 56 oo"},
      {inst:"LD D,n", z80Timing:"7", r800Timing:"2", opcodes:"16 nn"},
      {inst:"LD D,r", z80Timing:"4", r800Timing:"1", opcodes:"50+r"},
      {inst:"LD D,IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 50+p"},
      {inst:"LD D,IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 50+q"},
      {inst:"LD DE,(nn)", z80Timing:"20", r800Timing:"6", opcodes:"ED 5B nn nn"},
      {inst:"LD DE,nn", z80Timing:"10", r800Timing:"3", opcodes:"11 nn nn"},
      {inst:"LD E,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"5E"},
      {inst:"LD E,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 5E oo"},
      {inst:"LD E,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 5E oo"},
      {inst:"LD E,n", z80Timing:"7", r800Timing:"2", opcodes:"1E nn"},
      {inst:"LD E,r", z80Timing:"4", r800Timing:"1", opcodes:"58+r"},
      {inst:"LD E,IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 58+p"},
      {inst:"LD E,IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 58+q"},
      {inst:"LD H,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"66"},
      {inst:"LD H,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 66 oo"},
      {inst:"LD H,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 66 oo"},
      {inst:"LD H,n", z80Timing:"7", r800Timing:"2", opcodes:"26 nn"},
      {inst:"LD H,r", z80Timing:"4", r800Timing:"1", opcodes:"60+r"},
      {inst:"LD HL,(nn)", z80Timing:"16", r800Timing:"5", opcodes:"2A nn nn"},
      {inst:"LD HL,nn", z80Timing:"10", r800Timing:"3", opcodes:"21 nn nn"},
      {inst:"LD I,A", z80Timing:"9", r800Timing:"2", opcodes:"ED 47"},
      {inst:"LD IX,(nn)", z80Timing:"20", r800Timing:"6", opcodes:"DD 2A nn nn"},
      {inst:"LD IX,nn", z80Timing:"14", r800Timing:"4", opcodes:"DD 21 nn nn"},
      {inst:"LD IXh,n", z80Timing:"11", r800Timing:"3", opcodes:"DD 26 nn"},
      {inst:"LD IXh,p", z80Timing:"8", r800Timing:"2", opcodes:"DD 60+p"},
      {inst:"LD IXl,n", z80Timing:"11", r800Timing:"3", opcodes:"DD 2E nn"},
      {inst:"LD IXl,p", z80Timing:"8", r800Timing:"2", opcodes:"DD 68+p"},
      {inst:"LD IY,(nn)", z80Timing:"20", r800Timing:"6", opcodes:"FD 2A nn nn"},
      {inst:"LD IY,nn", z80Timing:"14", r800Timing:"4", opcodes:"FD 21 nn nn"},
      {inst:"LD IYh,n", z80Timing:"11", r800Timing:"3", opcodes:"FD 26 nn"},
      {inst:"LD IYh,q", z80Timing:"8", r800Timing:"2", opcodes:"FD 60+q"},
      {inst:"LD IYl,n", z80Timing:"11", r800Timing:"3", opcodes:"FD 2E nn"},
      {inst:"LD IYl,q", z80Timing:"8", r800Timing:"2", opcodes:"FD 68+q"},
      {inst:"LD L,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"6E"},
      {inst:"LD L,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 6E oo"},
      {inst:"LD L,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 6E oo"},
      {inst:"LD L,n", z80Timing:"7", r800Timing:"2", opcodes:"2E nn"},
      {inst:"LD L,r", z80Timing:"4", r800Timing:"1", opcodes:"68+r"},
      {inst:"LD R,A", z80Timing:"9", r800Timing:"2", opcodes:"ED 4F"},
      {inst:"LD SP,(nn)", z80Timing:"20", r800Timing:"6", opcodes:"ED 7B nn nn"},
      {inst:"LD SP,HL", z80Timing:"6", r800Timing:"1", opcodes:"F9"},
      {inst:"LD SP,IX", z80Timing:"10", r800Timing:"2", opcodes:"DD F9"},
      {inst:"LD SP,IY", z80Timing:"10", r800Timing:"2", opcodes:"FD F9"},
      {inst:"LD SP,nn", z80Timing:"10", r800Timing:"3", opcodes:"31 nn nn"},
      {inst:"LDD", z80Timing:"16", r800Timing:"4", opcodes:"ED A8"},
      {inst:"LDDR", z80Timing:"21/16", r800Timing:"4", opcodes:"ED B8"},
      {inst:"LDI", z80Timing:"16", r800Timing:"4", opcodes:"ED A0"},
      {inst:"LDIR", z80Timing:"21/16", r800Timing:"4", opcodes:"ED B0"},
      {inst:"MULUB A,r", z80Timing:"", r800Timing:"14", opcodes:"ED C1+8*r"},
      {inst:"MULUW HL,BC", z80Timing:"", r800Timing:"36", opcodes:"ED C3"},
      {inst:"MULUW HL,SP", z80Timing:"", r800Timing:"36", opcodes:"ED F3"},
      {inst:"NEG", z80Timing:"8", r800Timing:"2", opcodes:"ED 44"},
      {inst:"NOP", z80Timing:"4", r800Timing:"1", opcodes:"00"},
      {inst:"OR (HL)", z80Timing:"7", r800Timing:"2", opcodes:"B6"},
      {inst:"OR (IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD B6 oo"},
      {inst:"OR (IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD B6 oo"},
      {inst:"OR n", z80Timing:"7", r800Timing:"2", opcodes:"F6 nn"},
      {inst:"OR r", z80Timing:"4", r800Timing:"1", opcodes:"B0+r"},
      {inst:"OR IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD B0+p"},
      {inst:"OR IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD B0+q"},
      {inst:"OTDR", z80Timing:"21/16", r800Timing:"4/3", opcodes:"ED BB"},
      {inst:"OTIR", z80Timing:"21/16", r800Timing:"4/3", opcodes:"ED B3"},
      {inst:"OUT (C),A", z80Timing:"12", r800Timing:"3", opcodes:"ED 79"},
      {inst:"OUT (C),B", z80Timing:"12", r800Timing:"3", opcodes:"ED 41"},
      {inst:"OUT (C),C", z80Timing:"12", r800Timing:"3", opcodes:"ED 49"},
      {inst:"OUT (C),D", z80Timing:"12", r800Timing:"3", opcodes:"ED 51"},
      {inst:"OUT (C),E", z80Timing:"12", r800Timing:"3", opcodes:"ED 59"},
      {inst:"OUT (C),H", z80Timing:"12", r800Timing:"3", opcodes:"ED 61"},
      {inst:"OUT (C),L", z80Timing:"12", r800Timing:"3", opcodes:"ED 69"},
      {inst:"OUT (n),A", z80Timing:"11", r800Timing:"3", opcodes:"D3 nn"},
      {inst:"OUTD", z80Timing:"16", r800Timing:"4", opcodes:"ED AB"},
      {inst:"OUTI", z80Timing:"16", r800Timing:"4", opcodes:"ED A3"},
      {inst:"POP AF", z80Timing:"10", r800Timing:"3", opcodes:"F1"},
      {inst:"POP BC", z80Timing:"10", r800Timing:"3", opcodes:"C1"},
      {inst:"POP DE", z80Timing:"10", r800Timing:"3", opcodes:"D1"},
      {inst:"POP HL", z80Timing:"10", r800Timing:"3", opcodes:"E1"},
      {inst:"POP IX", z80Timing:"14", r800Timing:"4", opcodes:"DD E1"},
      {inst:"POP IY", z80Timing:"14", r800Timing:"4", opcodes:"FD E1"},
      {inst:"PUSH AF", z80Timing:"11", r800Timing:"4", opcodes:"F5"},
      {inst:"PUSH BC", z80Timing:"11", r800Timing:"4", opcodes:"C5"},
      {inst:"PUSH DE", z80Timing:"11", r800Timing:"4", opcodes:"D5"},
      {inst:"PUSH HL", z80Timing:"11", r800Timing:"4", opcodes:"E5"},
      {inst:"PUSH IX", z80Timing:"15", r800Timing:"5", opcodes:"DD E5"},
      {inst:"PUSH IY", z80Timing:"15", r800Timing:"5", opcodes:"FD E5"},
      {inst:"RES b,(HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB 86+8*b"},
      {inst:"RES b,(IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo 86+8*b"},
      {inst:"RES b,(IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo 86+8*b"},
      {inst:"RES b,r", z80Timing:"8", r800Timing:"2", opcodes:"CB 80+8*b+r"},
      {inst:"RET", z80Timing:"10", r800Timing:"3", opcodes:"C9"},
      {inst:"RET C", z80Timing:"11/5", r800Timing:"3/1", opcodes:"D8"},
      {inst:"RET M", z80Timing:"11/5", r800Timing:"3/1", opcodes:"F8"},
      {inst:"RET NC", z80Timing:"11/5", r800Timing:"3/1", opcodes:"D0"},
      {inst:"RET NZ", z80Timing:"11/5", r800Timing:"3/1", opcodes:"C0"},
      {inst:"RET P", z80Timing:"11/5", r800Timing:"3/1", opcodes:"F0"},
      {inst:"RET PE", z80Timing:"11/5", r800Timing:"3/1", opcodes:"E8"},
      {inst:"RET PO", z80Timing:"11/5", r800Timing:"3/1", opcodes:"E0"},
      {inst:"RET Z", z80Timing:"11/5", r800Timing:"3/1", opcodes:"C8"},
      {inst:"RETI", z80Timing:"14", r800Timing:"5", opcodes:"ED 4D"},
      {inst:"RETN", z80Timing:"14", r800Timing:"5", opcodes:"ED 45"},
      {inst:"RL (HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB 16"},
      {inst:"RL (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo 16"},
      {inst:"RL (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo 16"},
      {inst:"RL r", z80Timing:"8", r800Timing:"2", opcodes:"CB 10+r"},
      {inst:"RLA", z80Timing:"4", r800Timing:"1", opcodes:"17"},
      {inst:"RLC (HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB 06"},
      {inst:"RLC (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo 06"},
      {inst:"RLC (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo 06"},
      {inst:"RLC r", z80Timing:"8", r800Timing:"2", opcodes:"CB 00+r"},
      {inst:"RLCA", z80Timing:"4", r800Timing:"1", opcodes:"07"},
      {inst:"RLD", z80Timing:"18", r800Timing:"5", opcodes:"ED 6F"},
      {inst:"RR (HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB 1E"},
      {inst:"RR (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo 1E"},
      {inst:"RR (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo 1E"},
      {inst:"RR r", z80Timing:"8", r800Timing:"2", opcodes:"CB 18+r"},
      {inst:"RRA", z80Timing:"4", r800Timing:"1", opcodes:"1F"},
      {inst:"RRC (HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB 0E"},
      {inst:"RRC (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo 0E"},
      {inst:"RRC (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo 0E"},
      {inst:"RRC r", z80Timing:"8", r800Timing:"2", opcodes:"CB 08+r"},
      {inst:"RRCA", z80Timing:"4", r800Timing:"1", opcodes:"0F"},
      {inst:"RRD", z80Timing:"18", r800Timing:"5", opcodes:"ED 67"},
      {inst:"RST 0", z80Timing:"11", r800Timing:"4", opcodes:"C7"},
      {inst:"RST 8H", z80Timing:"11", r800Timing:"4", opcodes:"CF"},
      {inst:"RST 10H", z80Timing:"11", r800Timing:"4", opcodes:"D7"},
      {inst:"RST 18H", z80Timing:"11", r800Timing:"4", opcodes:"DF"},
      {inst:"RST 20H", z80Timing:"11", r800Timing:"4", opcodes:"E7"},
      {inst:"RST 28H", z80Timing:"11", r800Timing:"4", opcodes:"EF"},
      {inst:"RST 30H", z80Timing:"11", r800Timing:"4", opcodes:"F7"},
      {inst:"RST 38H", z80Timing:"11", r800Timing:"4", opcodes:"FF"},
      {inst:"SBC A,(HL)", z80Timing:"7", r800Timing:"2", opcodes:"9E"},
      {inst:"SBC A,(IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 9E oo"},
      {inst:"SBC A,(IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 9E oo"},
      {inst:"SBC A,n", z80Timing:"7", r800Timing:"2", opcodes:"DE nn"},
      {inst:"SBC A,r", z80Timing:"4", r800Timing:"1", opcodes:"98+r"},
      {inst:"SBC A,IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 98+p"},
      {inst:"SBC A,IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 98+q"},
      {inst:"SBC HL,BC", z80Timing:"15", r800Timing:"2", opcodes:"ED 42"},
      {inst:"SBC HL,DE", z80Timing:"15", r800Timing:"2", opcodes:"ED 52"},
      {inst:"SBC HL,HL", z80Timing:"15", r800Timing:"2", opcodes:"ED 62"},
      {inst:"SBC HL,SP", z80Timing:"15", r800Timing:"2", opcodes:"ED 72"},
      {inst:"SCF", z80Timing:"4", r800Timing:"1", opcodes:"37"},
      {inst:"SET b,(HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB C6+8*b"},
      {inst:"SET b,(IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo C6+8*b"},
      {inst:"SET b,(IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo C6+8*b"},
      {inst:"SET b,r", z80Timing:"8", r800Timing:"2", opcodes:"CB C0+8*b+r"},
      {inst:"SLA (HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB 26"},
      {inst:"SLA (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo 26"},
      {inst:"SLA (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo 26"},
      {inst:"SLA r", z80Timing:"8", r800Timing:"2", opcodes:"CB 20+r"},
      {inst:"SRA (HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB 2E"},
      {inst:"SRA (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo 2E"},
      {inst:"SRA (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo 2E"},
      {inst:"SRA r", z80Timing:"8", r800Timing:"2", opcodes:"CB 28+r"},
      {inst:"SRL (HL)", z80Timing:"15", r800Timing:"5", opcodes:"CB 3E"},
      {inst:"SRL (IX+o)", z80Timing:"23", r800Timing:"7", opcodes:"DD CB oo 3E"},
      {inst:"SRL (IY+o)", z80Timing:"23", r800Timing:"7", opcodes:"FD CB oo 3E"},
      {inst:"SRL r", z80Timing:"8", r800Timing:"2", opcodes:"CB 38+r"},
      {inst:"SUB (HL)", z80Timing:"7", r800Timing:"2", opcodes:"96"},
      {inst:"SUB (IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD 96 oo"},
      {inst:"SUB (IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD 96 oo"},
      {inst:"SUB n", z80Timing:"7", r800Timing:"2", opcodes:"D6 nn"},
      {inst:"SUB r", z80Timing:"4", r800Timing:"1", opcodes:"90+r"},
      {inst:"SUB IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD 90+p"},
      {inst:"SUB IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD 90+q"},
      {inst:"XOR (HL)", z80Timing:"7", r800Timing:"2", opcodes:"AE"},
      {inst:"XOR (IX+o)", z80Timing:"19", r800Timing:"5", opcodes:"DD AE oo"},
      {inst:"XOR (IY+o)", z80Timing:"19", r800Timing:"5", opcodes:"FD AE oo"},
      {inst:"XOR n", z80Timing:"7", r800Timing:"2", opcodes:"EE nn"},
      {inst:"XOR r", z80Timing:"4", r800Timing:"1", opcodes:"A8+r"},
      {inst:"XOR IXp", z80Timing:"8", r800Timing:"2", opcodes:"DD A8+p"},
      {inst:"XOR IYq", z80Timing:"8", r800Timing:"2", opcodes:"FD A8+q"}
];

function tryParseHex(value) {
  return value.replace(/([0-9A-F]+)/g, '0x$1');
}

function lpad(t, n) {
  return (t + (new Array(n+1).join(' '))).substr(0, n);
}

function buildArg(arg) {
  switch(arg) {
    case 'b'      : return ' b:Int3';
    case 'n'      : return ' nn:Int8';
    case '(n)'    : return ' "(" _ nn:Int8 _ ")"';
    case 'nn'     : return ' nn:Int16';
    case '(nn)'   : return ' "(" _ nn:Int16 _ ")"';
    case '(IX+o)' : return ' "(" _ "IX"i _ oo:Offset8 _ ")"';
    case '(IY+o)' : return ' "(" _ "IY"i _ oo:Offset8 _ ")"';
    case 'r'      : return ' r:TableR';
    case 'IXp'    : return ' p:TableIXp';
    case 'IYq'    : return ' q:TableIYq';
    default    : return util.format(' "%s"i', arg);
  }
}

function buildOpcodes(opcodes) {
  var output = _.map(opcodes.split(' '), tryParseHex);
  return util.format('%j', output)
         .replace(/"/g, '')
         .replace('nn,nn', 'nn&255,nn>>8');
}

function build(inst) {
  var rule = "";
  var i = inst.inst.split(/[\ ,]/);
  rule += util.format('"%s"i', i[0]);
  if(i.length > 1) {
    rule = rule + ' _' + buildArg(i[1]);
  }
  if(i.length > 2) {
    rule = rule + ' _ "," _' + buildArg(i[2]);
  }

    return util.format(
        "%s\t\t{ return %s; } // %s",
        lpad(rule, 80),
        buildOpcodes(inst.opcodes),
        inst.inst);
}

console.log("  = %s", build(_.first(insts)));
_.each(_.rest(insts), function(inst) {
  console.log("  / %s", build(inst));
});