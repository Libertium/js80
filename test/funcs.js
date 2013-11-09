'use strict';

var should = require('should')
  , JS80 = require ('../lib/js80')
  , _ = require('underscore');

describe('funcs', function() {
  it('org 8000h \n nop', function() {
    var js80 = new JS80();
    js80.asm('org 8000h\nnop');
    should(js80.image.build()).be.eql([0]);
    should(js80.image.page.origin + js80.image.page.offset).be.eql(0x8001);
  });

  it('db 1,2,3', function() {
    var js80 = new JS80();
    js80.asm('db 1,2,3');
    should(js80.image.build()).be.eql([1,2,3]);
  });

  it('dw 1,2,3', function() {
    var js80 = new JS80();
    js80.asm('dw 1,2,3');
    should(js80.image.build()).be.eql([1,0,2,0,3,0]);
  });

  it('ds 5', function() {
    var js80 = new JS80();
    js80.asm('ds 5');
    should(js80.image.build()).be.eql([0,0,0,0,0]);
  });

  it('db "hello", 0', function() {
    var js80 = new JS80();
    js80.asm('db "hello", 0');
    should(js80.image.build()).be.eql([104,101,108,108,111,0]);
  });

  it('pepe equ 123\nld a,pepe', function() {
    var js80 = new JS80();
    js80.asm('pepe equ 123\nld a,pepe');
    should(js80.image.build()).be.eql([0x3e, 123]);
  });

  it('modules', function() {
    var js80 = new JS80();
    js80.asm('org 8000h\nmodule m1\nl1: nop\nmodule m2\nl2: nop\nmodule m3\nld hl,m1.l1+m2.l2');
    should(js80.image.build()).be.eql([0,0,0x21,1,(0x80+0x80)&255]);
  });

  it('include', function() {
    var js80 = new JS80();
    js80.searchPath.push('examples');
    js80.asm('include "hello.asm"');
    should(js80.image.build().length).not.be.eql(0);
  });

  it('ds fill', function() {
    var js80 = new JS80();
    js80.asm('org 8000h\nnop\nds 0x8000+0x2000-$,0xff');
    var image = js80.image.build();
    should(image.length).be.eql(0x2000);
    should(image[1]).be.equal(255);
  });

  it('incbin', function() {
    var js80 = new JS80();
    js80.asm('incbin "examples/hello.asm"');
    should(js80.image.build().length).not.be.eql(0);
  });

  it('incbin len', function() {
    var js80 = new JS80();
    js80.asm('incbin "examples/hello.asm",10,10');
    should(js80.image.build().length).be.eql(10);
  });

  it('endmodule', function() {
    var js80 = new JS80();
    js80.asm('module test\nl1: nop\nendmodule\nl2: nop\nmodule test2\ncall test.l1\ncall l2');
    should(js80.image.build().length).not.be.eql([0,0,0xcd,0,0,0xcd,1,0]);
  });

  it('macro noargs', function() {
    var js80 = new JS80();
    js80.asm('macro test\nnop\nnop\nendmacro\ntest\ntest');
    should(js80.image.build().length).not.be.eql([0,0,0,0]);
  });

  it('macro with fixed args', function() {
    var js80 = new JS80();
    js80.asm('macro test arg1,arg2\nld a,arg1+arg2\nendmacro\ntest 1,2');
    should(js80.image.build().length).not.be.eql([0x3e, 1+2]);
  });

  it('macro with default args', function() {
    var js80 = new JS80();
    js80.asm('macro test arg1,arg2:10\nld a,arg1+arg2\nendmacro\ntest 1');
    should(js80.image.build().length).not.be.eql([0x3e, 1+10]);
  });

  it('repeat', function() {
    var js80 = new JS80();
    js80.asm('repeat 2\nnop\nnop\nendrepeat');
    should(js80.image.build()).be.eql([0,0,0,0]);
  });

  it('repeat^2', function() {
    var js80 = new JS80();
    js80.asm('repeat 2\nrepeat 2\nnop\nendrepeat\nendrepeat');
    should(js80.image.build()).be.eql([0,0,0,0]);
  });

  it('macro with variable args', function() {
    var js80 = new JS80();
    js80.asm('macro test base,1..*\nrepeat @0\ndb base+@1\nrotate 1\nendrepeat\nendmacro\ntest 10,1,2,3');
    should(js80.image.build()).be.eql([11,12,13]);
  });

  it('map', function() {
    var js80 = new JS80();
    js80.asm('map 0xc000\ntest equ # 1\ntest2 equ # 2\nld hl,test\nld hl,test2');
    should(js80.image.build()).be.eql([0x21,0,0xc0,0x21,1,0xc0]);
  });

  it('defpage 0', function() {
    var js80 = new JS80();
    js80.asm('defpage 0,0x4000,0x2000\\page 0\\ld hl,$');
    var image = js80.image.build();
    should(image.length).be.eql(0x2000);
    should(_.first(image, 3)).be.eql([0x21, 0, 0x40]);
  });

  it('dw label, 10', function() {
    var js80 = new JS80();
    js80.asm('dw start, 10\nstart:');
    should(js80.image.build()).be.eql([4, 0, 10, 0]);
  });

  it('no macro', function() {
    var js80 = new JS80();
    js80.asm('macro nop\n@@nop\n@@nop\nendmacro\nnop');
    should(js80.image.build()).be.eql([0, 0]);
  });

  it('multiple pages', function() {
    var js80 = new JS80();
    js80.asm('defpage 0,0,1\ndefpage 1,1,1\ndefpage 2,2,1\npage 0..2\ndb 1,2,3');
    should(js80.image.build()).be.eql([1,2,3]);
  });

  it('multiple defpages', function() {
    var js80 = new JS80();
    js80.asm('defpage 0..2,0,1\npage 0..2\ndb 1,2,3');
    should(js80.image.build()).be.eql([1,2,3]);
  });

  it('error', function() {
    var js80 = new JS80();
    (function() {
      js80.asm('error "jarl"');
    }).should.throw('jarl');
  });
});