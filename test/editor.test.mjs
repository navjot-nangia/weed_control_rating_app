import test from 'node:test';import assert from 'node:assert/strict';
import {brushSegment,encodeMask,decodeMask,moveRectangle,resizeRectangle,PhotoEditor} from '../public/editor.js';
import {analyze} from '../public/analysis.js';
test('box movement stays inside the image and keeps dimensions',()=>{assert.deepEqual(moveRectangle({x:.2,y:.3,w:.4,h:.5},1,-1),{x:.6,y:0,w:.4,h:.5});});
test('corner resize keeps opposite corner fixed and prevents inversion',()=>{const r={x:.2,y:.2,w:.5,h:.5};const resized=resizeRectangle(r,'nw',{x:.1,y:.1});assert.ok(Math.abs(resized.w-.6)<1e-9);assert.equal(resized.x,.1);assert.ok(Math.abs(resized.y+resized.h-.7)<1e-9);const clamped=resizeRectangle(r,'se',{x:-1,y:2});assert.ok(clamped.w>0);assert.equal(clamped.y+clamped.h,1);});
test('fast brush movement paints a continuous path; eraser removes its center',()=>{const mask=new Uint8Array(100);brushSegment(mask,10,10,{x:.05,y:.55},{x:.95,y:.55},.8);for(let x=0;x<10;x++)assert.equal(mask[50+x],1);brushSegment(mask,10,10,{x:.55,y:.55},{x:.55,y:.55},.7,true);assert.equal(mask[55],0);assert.equal(mask[54],1);});
test('brush masks round-trip exactly through JSON run-length encoding',()=>{const mask=new Uint8Array([0,1,1,0,1,0,1,1,1]);const runs=JSON.parse(JSON.stringify(encodeMask(mask)));assert.deepEqual(runs,[1,2,4,1,6,3]);assert.deepEqual(decodeMask(runs,mask.length),mask);assert.deepEqual(encodeMask(new Uint8Array(5)),[]);});
test('brush and rectangle union excludes pixels once, independent of mask display or zoom',()=>{const data=new Uint8ClampedArray([0,255,0,255,0,255,0,255,255,0,0,255,255,0,0,255]);const brush=new Uint8Array([1,1,0,0]);const r=analyze(data,4,1,.1,null,[{x:0,y:0,w:.25,h:1}],brush);assert.equal(r.total,2);assert.equal(r.green,0);assert.equal(r.cover,0);assert.equal(r.mask[3],0);assert.equal(analyze(data,4,1,.1,null,[],new Uint8Array([1,1,1,1])).cover,null);});

test('editor pointer flow supports box edit, brush, zoom, pan and undo without changing image coordinates',()=>{
 const originals={document:globalThis.document,ResizeObserver:globalThis.ResizeObserver,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 const context={putImageData(){},drawImage(){},fillRect(){},strokeRect(){},beginPath(){},rect(){},fill(){},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};}};
 const canvas={width:100,height:100,style:{},getContext:()=>context,get offsetWidth(){return parseFloat(this.style.width)||100;},get offsetHeight(){return this.offsetWidth;},getBoundingClientRect(){return {left:0,top:0,width:this.offsetWidth,height:this.offsetHeight};},setPointerCapture(){}};
 const viewport={clientWidth:100,clientHeight:100,scrollLeft:0,scrollTop:0};
 globalThis.document={createElement:()=>({getContext:()=>context})};globalThis.ResizeObserver=class{observe(){}disconnect(){}};globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
 try{
 const photo={data:{width:100,height:100,data:new Uint8ClampedArray(40000)},roi:null,exclusions:[]};
 const editor=new PhotoEditor(canvas,viewport,photo,.1,()=>{},()=>{});
 const event=(x,y)=>({clientX:x,clientY:y,pointerId:1,button:0,preventDefault(){}});
 editor.down(event(10,10));editor.up(event(40,40));assert.equal(photo.exclusions.length,1);assert.equal(photo.exclusions[0].x,.1);
 editor.setTool('edit');editor.down(event(25,25));editor.up(event(35,35));assert.ok(Math.abs(photo.exclusions[0].x-.2)<1e-9);
 editor.down(event(50,50));editor.up(event(70,70));assert.ok(Math.abs(photo.exclusions[0].w-.5)<1e-9);
 editor.undo();assert.ok(Math.abs(photo.exclusions[0].w-.3)<1e-9);
 editor.setZoom(2);editor.setTool('brush');editor.brushSize=10;editor.down(event(100,100));editor.up(event(120,100));assert.equal(photo.brush[50*100+50],1);
 const before=encodeMask(photo.brush);editor.setZoom(3);assert.deepEqual(encodeMask(photo.brush),before);
 editor.setTool('pan');const start=viewport.scrollLeft;editor.down(event(50,50));editor.up(event(30,50));assert.equal(viewport.scrollLeft,start+20);
 editor.undo();assert.equal(photo.brush.some(Boolean),false);assert.equal(photo.exclusions.length,1);editor.destroy();
 }finally{Object.assign(globalThis,originals);}
});
