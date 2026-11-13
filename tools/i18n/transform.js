// Membungkus literal teks tampilan di bundle dengan __T(...) dan mengumpulkan daftar teks sumber.
// Pakai: node transform.js <index.html masuk> <index.html keluar> <strings.json keluar> [residu.txt]
const fs=require('fs'); const parser=require('@babel/parser'); const traverse=require('@babel/traverse').default;
const [,, IN, OUT, STR, RES]=process.argv;
const html=fs.readFileSync(IN,'utf8');
// bundle = <script> terakhir yang berisi kode aplikasi (diawali "(()=>{")
const tagBuka='<script>(()=>{'; const b0=html.lastIndexOf(tagBuka); if(b0<0) throw 'bundle tidak ketemu';
const c0=b0+'<script>'.length; const c1=html.indexOf('</script>',c0); const code=html.slice(c0,c1);
const ast=parser.parse(code,{sourceType:'script'});
const isLit=n=>n&&(n.type==='StringLiteral'||(n.type==='TemplateLiteral'&&n.expressions.length===0));
const val=n=>n.type==='StringLiteral'?n.value:n.quasis[0].value.cooked;
const adaHuruf=v=>/\p{L}{2}/u.test(v);
const bukanTeks=v=>/^\s*$/.test(v)||/^(translate|rotate|scale|matrix)\(/.test(v)||/^[MLCZHVQSAmlczhvqsa0-9 ,.\-]+$/.test(v)||/^[a-z0-9_\-:./#]+$/.test(v)||/^\s*<(path|g|rect|circle|ellipse|line|polyline|polygon|svg)\b/.test(v);
const TEXT_KEYS=new Set(['deskripsi','keterangan','subjudul','petunjuk','tujuan','hasil','alasan','contoh','pesan','sumberTeks','isi','teks','intro','ringkas','judul','penjelasan','pertanyaan','label','ringkasan','catatan','nama','padanan','definisi']);
const ARR_HITAM=new Set(['tag','babIds','istilahIds','adeganIds','klasifikasiIds','sinonim','ref','gambar','indikasi','tulang','region','kelas','urutan','ids','kunci']);
const target=new Map(); // start -> {node, lang, ctx}
// teks yang juga dipakai kode sebagai pembanding/kunci tidak boleh diterjemahkan
const PAKAI=new Set(); { const METH=new Set(['includes','startsWith','endsWith','indexOf','split','test','match','has','get','find','findIndex','some','filter']); const add=n=>{ if(n&&n.type==='StringLiteral') PAKAI.add(n.value); };
  traverse(ast,{BinaryExpression(p){ if(['===','!==','==','!=','in'].includes(p.node.operator)){add(p.node.left);add(p.node.right);} }, SwitchCase(p){add(p.node.test);},
    CallExpression(p){ const c=p.node.callee; if(c.type==='MemberExpression'&&c.property.name&&METH.has(c.property.name)) p.node.arguments.forEach(add); },
    ObjectProperty(p){ const k=p.node.key; if(!p.node.computed) PAKAI.add(k.type==='StringLiteral'?k.value:k.name); }, MemberExpression(p){ if(p.node.computed) add(p.node.property); } }); }
const PASTI=new Set(['pair','ui','fn:l','fn:e']);
const tambah=(n,lang,ctx)=>{ if(!isLit(n))return; const v=val(n); if(!adaHuruf(v)||PAKAI.has(v))return; if(bukanTeks(v)&&!(PASTI.has(ctx)&&/^[\p{L}][\p{L}\s/.-]*$/u.test(v)))return; target.set(n.start,{n,lang,ctx,v}); };
function daun(n,lang,ctx){ if(!n)return; if(isLit(n)) return tambah(n,lang,ctx); if(n.type==='BinaryExpression'&&n.operator==='+'){daun(n.left,lang,ctx);daun(n.right,lang,ctx);} else if(n.type==='ConditionalExpression'){daun(n.consequent,lang,ctx);daun(n.alternate,lang,ctx);} }
function larik(a,lang,ctx){ a.elements.forEach(e=>{ if(!e)return; if(e.type==='ArrayExpression') larik(e,lang,ctx); else if(isLit(e)&&teksAlami(val(e))) tambah(e,lang,ctx); }); }
const teksAlami=v=>/\s/.test(v.trim())||/[A-ZÀ-ÿ]/.test(v)||/[^\x00-\x7f]/.test(v);
const kunciObj=o=>o.properties.map(q=>q.key&&(q.key.name??q.key.value));
// definisi fungsi -> peran argumen
const peranFn=new Map(); // node def start -> array idx of args (lang)
function peranDari(def, src){
  if(/^function l\(a,i\)\{return a&&typeof a=="object"\?_s\(\)/.test(src)) return [[1,'en']];
  if(/^\(\w,\w\)=>\w\?\w:\w$/.test(src)) { const m=src.match(/^\((\w),(\w)\)=>\w\?(\w):(\w)$/); if(m&&m[3]===m[2]&&m[4]===m[1]) return [[1,'en']]; }
  if(/^\(\w,\w,\w,\w="start"\)=>`<text class="anot-teks"/.test(src)) return [[2,'id']];
  if(/^\(a,i=""\)=>\w+\(4,146,a\)\+\(i\?\w+\(4,157,i\):""\)$/.test(src)) return [[0,'id'],[1,'id']];
  if(/^\(r,s=""\)=>\w+\(4,14,"anterior"\)/.test(src)) return [[0,'id'],[1,'id']];
  if(/^\(a,i,e,r,s=\[\],u=\[\]\)=>\(\{id:a,istilah:i,padanan:e,definisi:r/.test(src)) return [[2,'id'],[3,'id']];
  return null;
}
traverse(ast,{
  ObjectExpression(p){ const o=p.node; const ks=kunciObj(o);
    const pasangan=ks.includes('id')&&ks.includes('en');
    if(pasangan){ o.properties.forEach(q=>{ if(q.type==='ObjectProperty'&&(q.key.name??q.key.value)==='en') daun(q.value,'en','pair'); }); return; }
    // tabel singkatan: banyak properti bernilai "... — ..."
    const vals=o.properties.filter(q=>q.type==='ObjectProperty'&&isLit(q.value));
    if(vals.length>=20 && vals.filter(q=>/ — /.test(val(q.value))).length>=vals.length*0.8){ vals.forEach(q=>tambah(q.value,'id','singkatan')); return; }
    // tabel UI M: kunci -> [id, en]
    const arr=o.properties.filter(q=>q.type==='ObjectProperty'&&q.value.type==='ArrayExpression'&&q.value.elements.length===2&&isLit(q.value.elements[0])&&isLit(q.value.elements[1]));
    if(arr.length>=10 && arr.length>=o.properties.length*0.8){ arr.forEach(q=>tambah(q.value.elements[1],'en','ui')); return; }
    o.properties.forEach(q=>{ if(q.type!=='ObjectProperty')return; const k=q.key.name??q.key.value;
      if(TEXT_KEYS.has(k)) tambah(q.value,'id',k);
      if(q.value.type==='ArrayExpression' && !ARR_HITAM.has(k)) larik(q.value,'id','arr:'+k);
    });
  },
  StringLiteral(p){ const v=p.node.value; if(/<text class="(anot-teks|potong-teks)"/.test(v)||/class="potong-teks"/.test(v)) tambah(p.node,'id','svgteks'); },
  CallExpression(p){ const n=p.node; if(n.callee.type!=='Identifier')return; const b=p.scope.getBinding(n.callee.name); if(!b)return;
    let d=b.path.node; let src;
    if(d.type==='VariableDeclarator'){ let init=d.init; if(!init){ const cv=b.constantViolations[0]; if(cv&&cv.node.type==='AssignmentExpression') init=cv.node.right; } if(!init)return; src=code.slice(init.start,init.end); }
    else if(d.type==='FunctionDeclaration'){ src=code.slice(d.start,d.end); }
    else return;
    if(!peranFn.has(d.start)) peranFn.set(d.start, peranDari(d, src));
    const peran=peranFn.get(d.start); if(!peran)return;
    peran.forEach(([i,lang])=>tambah(n.arguments[i],lang,(lang==='en'&&peran.length===1&&i===1)?'fn:l':'fn:'+n.callee.name));
  },
});
// daftar teks unik (urutan = nomor indeks di kamus)
const uniq=new Map(); for(const t of target.values()){ const k=t.v; if(!uniq.has(k)) uniq.set(k,{s:k,lang:t.lang,ctx:t.ctx,n:0,idx:uniq.size}); uniq.get(k).n++; }
const daftar=[...uniq.values()];
// tulis ulang: "teks" -> __T(indeks,"teks")
const urut=[...target.values()].sort((a,b)=>b.n.start-a.n.start);
let out=code; for(const t of urut){ out=out.slice(0,t.n.start)+'__T('+uniq.get(t.v).idx+','+out.slice(t.n.start,t.n.end)+')'+out.slice(t.n.end); }
fs.writeFileSync(OUT, html.slice(0,c0)+out+html.slice(c1)); fs.writeFileSync(STR, JSON.stringify(daftar,null,0));
const per={}; daftar.forEach(x=>{per[x.ctx]=per[x.ctx]||[0,0];per[x.ctx][0]++;per[x.ctx][1]+=x.s.length;});
console.log('dibungkus',target.size,'unik',daftar.length,'karakter',daftar.reduce((a,x)=>a+x.s.length,0)); console.log(per);
// residu: literal teks yang tidak dibungkus
if(RES){ const res=[]; const ditandai=new Set(target.keys());
  // id-slot pasangan & arg0 l() tidak perlu
  traverse(ast,{ StringLiteral(p){ const n=p.node; if(ditandai.has(n.start))return; const v=n.value; if(!adaHuruf(v)||bukanTeks(v)||v.length<4)return;
      const par=p.parent; if(par.type==='ObjectProperty'&&par.key===n)return; if(par.type==='ObjectProperty'&&(par.key.name??par.key.value)==='id')return;
      if(par.type==='CallExpression'&&par.arguments[0]===n&&par.arguments.length===2&&ditandai.has(par.arguments[1].start))return;
      if(par.type==='ArrayExpression'&&par.elements.length===2&&par.elements[0]===n&&ditandai.has(par.elements[1].start))return;
      res.push(v); },
    TemplateLiteral(p){ const n=p.node; if(ditandai.has(n.start))return; n.quasis.forEach(q=>{ const t=q.value.cooked.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(); if(/\p{L}{3,}.*\s\p{L}{3,}/u.test(t)) res.push('`'+t.slice(0,140)); }); }
  });
  const cnt={}; res.forEach(v=>cnt[v]=(cnt[v]||0)+1);
  fs.writeFileSync(RES, Object.entries(cnt).sort((a,b)=>b[0].length-a[0].length).map(([v,c])=>c+'\t'+v.slice(0,160)).join('\n'));
  console.log('residu unik',Object.keys(cnt).length);
}
