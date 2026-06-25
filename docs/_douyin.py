import urllib.request, json

url = 'https://www.douyin.com/aweme/v1/web/user/profile/other/?sec_user_id=MS4wLjABAAAAXjhUweWgtf6CsxgQjK4o6PgJItch151ZGzgVKlkOEVo'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://www.douyin.com/',
    'Cookie': ''
})
try:
    resp = urllib.request.urlopen(req, timeout=15)
    data = json.loads(resp.read())
    print(json.dumps(data, indent=2, ensure_ascii=False)[:2000])
except Exception as e:
    print(f'Error: {e}')
