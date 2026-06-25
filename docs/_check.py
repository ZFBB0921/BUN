with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add platformUrls to DATA init
old_data = "let DATA={tasks:{},content:[],drafts:[],ideas:[],analytics:[]}"
new_data = "let DATA={tasks:{},content:[],drafts:[],ideas:[],analytics:[],platformUrls:[]}"
js = js.replace(old_data, new_data)

# 2. Add platformUrls to ld()
old_ld_urls = "if(!p.drafts)p.drafts=[];if(!p.analytics)p.analytics=[];DATA=p;return;"
new_ld_urls = "if(!p.drafts)p.drafts=[];if(!p.analytics)p.analytics=[];if(!p.platformUrls)p.platformUrls=[];DATA=p;return;"
js = js.replace(old_ld_urls, new_ld_urls)

# 3. Add platformUrls to sv()
old_sv_urls = "analytics:DATA.analytics"
new_sv_urls = "analytics:DATA.analytics,platformUrls:DATA.platformUrls"
js = js.replace(old_sv_urls, new_sv_urls)

# 4. Update updateQDPlatforms to auto-fill URL
old_upd_qd = '''function updateQDPlatforms(){
  const aid=document.getElementById('qdAccount').value;
  const platSel=document.getElementById('qdPlatform');
  if(!aid){platSel.innerHTML='<option value="">先选账号</option>';return;}
  const acc=ACCOUNTS.find(a=>a.id===aid);
  platSel.innerHTML='<option value="">选择平台</option>'+acc.platforms.map(p=>'<option value="'+p+'">'+p+'</option>').join('');
}'''

new_upd_qd = '''function updateQDPlatforms(){
  const aid=document.getElementById('qdAccount').value;
  const platSel=document.getElementById('qdPlatform');
  const urlInp=document.getElementById('qdUrl');
  if(!aid){platSel.innerHTML='<option value="">先选账号</option>';urlInp.value='';return;}
  const acc=ACCOUNTS.find(a=>a.id===aid);
  platSel.innerHTML='<option value="">选择平台</option>'+acc.platforms.map(p=>'<option value="'+p+'">'+p+'</option>').join('');
  platSel.onchange=()=>{
    const p=platSel.value;
    if(!p){urlInp.value='';return;}
    const saved=DATA.platformUrls.find(u=>u.accountId===aid&&u.platform===p);
    urlInp.value=saved?saved.url:'';
    urlInp.placeholder=saved?'':'输入主页链接，保存后下次自动填充';
  };
}'''

js = js.replace(old_upd_qd, new_upd_qd)

# 5. Update saveQuickData to save the URL permanently
old_save_url = "alert('数据已保存！');"
new_save_url = """const qdUrl=document.getElementById('qdUrl').value.trim();
  // Save URL to platformUrls for auto-fill
  if(qdUrl){
    let pu=DATA.platformUrls.find(u=>u.accountId===aid&&u.platform===plat);
    if(pu){pu.url=qdUrl;}else{
      DATA.platformUrls.push({accountId:aid,platform:plat,url:qdUrl});
    }
  }
  alert('数据已保存！');"""
js = js.replace(old_save_url, new_save_url)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('URL auto-fill system added')
