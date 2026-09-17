import sharp from 'sharp';
for (const width of [320,375,390,430,768,820,1024,1280,1440,1920]) {
 const images = await Promise.all(['home','about','insights','contact'].map(async route => {
  const input = await sharp(`qa-output/${route}-${width}.png`).resize({width:300}).toBuffer();
  const meta = await sharp(input).metadata();
  return {input,height:meta.height};
 }));
 await sharp({create:{width:1200,height:Math.max(...images.map(x=>x.height)),channels:3,background:'#dedede'}}).composite(images.map((x,i)=>({input:x.input,left:i*300,top:0}))).png().toFile(`qa-output/review-${width}.png`);
}
