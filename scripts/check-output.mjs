import fs from 'node:fs';
import path from 'node:path';
import {htmlToHast} from 'satteri';
const files=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
const walk=(node,fn)=>{fn(node);for(const child of node.children||[])walk(child,fn)};
const reports=[];
for(const file of files('dist').filter(file=>file.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');const tree=await htmlToHast(html);const elements=[];walk(tree,n=>{if(n.type==='element')elements.push(n)});
 const get=(tag,key,value)=>elements.find(n=>n.tagName===tag&&(Array.isArray(n.properties[key])?n.properties[key].includes(value):n.properties[key]===value));
 const title=elements.find(n=>n.tagName==='title')?.children.map(n=>n.value||'').join('');
 const description=get('meta','name','description')?.properties.content;
 const report={file,title,description,h1:elements.filter(n=>n.tagName==='h1').length,canonical:get('link','rel','canonical')?.properties.href,lang:elements.find(n=>n.tagName==='html')?.properties.lang,unwanted:/wp-content|elementor|jquery|casino|gambling|cryptocurrency|Lorem ipsum|informaÃ|â€/.test(html),structuredData:elements.filter(n=>n.tagName==='script'&&n.properties.type==='application/ld+json').every(n=>{try{JSON.parse(n.children.map(c=>c.value||'').join(''));return true}catch{return false}})};
 reports.push(report);
}
const errors=[];
for(const report of reports){if(!report.title||!report.description||!report.canonical||report.h1!==1||report.unwanted||!report.structuredData)errors.push(report.file)}
if(new Set(reports.map(r=>r.title)).size!==reports.length)errors.push('Duplicate titles');
if(new Set(reports.map(r=>r.description)).size!==reports.length)errors.push('Duplicate descriptions');
fs.writeFileSync('audit/output-check.json',JSON.stringify({reports,errors},null,2));console.log('Static pages:',reports.length,'unique titles:',new Set(reports.map(r=>r.title)).size,'errors:',errors);if(errors.length)process.exitCode=1;
