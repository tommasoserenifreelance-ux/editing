const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for (const [hash,out,w,h] of [['','flyer_A4.pdf','210mm','297mm'],['#bleed','flyer_A4_stampa_abbondanza3mm.pdf','216mm','303mm']]){
 await p.goto('file://'+path.resolve('flyer.html')+hash); await p.reload(); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);
 await p.pdf({path:out,width:w,height:h,printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
 // overflow check
 const r=await p.evaluate(()=>[...document.querySelectorAll('.inner')].map(e=>e.scrollHeight-e.clientHeight)); console.log(out,r);
}
await b.close()})()
