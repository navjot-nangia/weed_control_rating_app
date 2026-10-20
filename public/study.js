import {mean,rate} from './analysis.js?v=9';
import {baselineMode} from './capture.js?v=9';
export function generatePlots(treatments,blocks=3,start=101,stride=100){
 if(!Number.isInteger(blocks)||blocks<1||blocks>50)throw new Error('Use 1–50 blocks.');
 if(!Number.isInteger(start)||start<1||!Number.isInteger(stride)||stride<treatments.length)throw new Error('Check the starting number and block spacing.');
 return Array.from({length:blocks},(_,b)=>treatments.map((t,i)=>({id:crypto.randomUUID(),number:String(start+b*stride+i),block:String(b+1),treatmentId:t.id}))).flat();
}
export function timingDate(timing,applications){const a=applications.find(a=>a.id===timing.applicationId);if(!a?.date)return '';const d=new Date(a.date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+Number(timing.days));return d.toISOString().slice(0,10);}
export function validateStudy(s){
 if(!s.name.trim()||!s.objective.trim())return 'Add a study name and objective.';
 if(!s.treatments.length)return 'Add at least one treatment.';
 if(s.treatments.some(t=>!t.code.trim()||!t.name.trim()))return 'Give every treatment a code and name.';
 if(new Set(s.treatments.map(t=>t.code.trim().toLowerCase())).size!==s.treatments.length)return 'Treatment codes must be unique.';
 if(!s.applications.length)return 'Add at least one application.';
 if(!s.plots.length)return 'Add your plots.';
 if(s.plots.some(p=>!p.number.trim()||!p.block.trim()||!s.treatments.some(t=>t.id===p.treatmentId)))return 'Check plot numbers, blocks and treatments.';
 if(new Set(s.plots.map(p=>p.number.trim().toLowerCase())).size!==s.plots.length)return 'Plot numbers must be unique.';
 if(!s.timings.length)return 'Add at least one rating timing.';
 if(s.timings.some(t=>!t.name.trim()||!Number.isInteger(Number(t.days))||Number(t.days)<0||!s.applications.some(a=>a.id===t.applicationId)))return 'Check timing names, applications and days.';
 return '';
}
export function referencesFor(study,records,timingId,block){
 const inSession=records.filter(r=>r.studyId===study.id&&r.timingId===timingId&&r.block===block&&Number.isFinite(r.cover));
 // Average repeat photos per reference plot first, so one plot cannot dominate by photo count.
 function reference(role){const byPlot=new Map();for(const r of inSession.filter(r=>r.role===role)){if(!byPlot.has(r.plotId))byPlot.set(r.plotId,[]);byPlot.get(r.plotId).push(r);}return mean([...byPlot.values()].map(list=>({cover:mean(list)})));}
 const mode=baselineMode(study);return {untreated:mode==='clean'?null:reference('untreated'),clean:mode==='weedy'?null:reference('clean')};
}
export function plotResult(study,records,timingId,plot){const list=records.filter(r=>r.studyId===study.id&&r.timingId===timingId&&r.plotId===plot.id);const cover=mean(list.filter(r=>Number.isFinite(r.cover)));const refs=referencesFor(study,records,timingId,plot.block);const treatment=study.treatments.find(t=>t.id===plot.treatmentId);const control=treatment?.role==='treatment'&&cover!==null?rate(cover,refs.untreated,refs.clean):{control:null,raw:null};return {cover,...control,...refs,count:list.length,manual:mean(list.filter(r=>Number.isFinite(r.manual)).map(r=>({cover:r.manual})))};}
