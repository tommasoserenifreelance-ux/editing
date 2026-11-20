"""Genera wordpress-bonaccorso-lab.html da index.html: solo il contenuto della pagina,
con lo stile limitato a .bl-page e le immagini già incorporate (si incolla e basta)."""
import base64, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(here, 'index.html'), encoding='utf-8').read()
css = re.sub(r'/\*.*?\*/', '', re.search(r'<style>(.*?)</style>', s, re.S).group(1), flags=re.S)
main = re.search(r'<main>(.*?)</main>', s, re.S).group(1)

drop = ('.site-header', '.burger', '.site-footer', 'body', 'html', '*', ':root', 'img', 'a ', '.lista')
def scope(sel):
    return ', '.join('.bl-page ' + x.strip() for x in sel.split(','))
def keep(sel):
    sel = sel.strip() + ' '
    return not any(sel.startswith(d) for d in drop)

out = []
for blk in re.findall(r'@media[^{]+\{(?:[^{}]*\{[^{}]*\})*\s*\}|[^{}@]+\{[^{}]*\}', css):
    blk = blk.strip()
    if blk.startswith('@media'):
        head, inner = blk[:blk.index('{')], blk[blk.index('{') + 1:-1]
        rules = ['  %s {%s}' % (scope(sel), body) for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', inner) if keep(sel)]
        if rules:
            out.append(head.strip() + ' {\n' + '\n'.join(rules) + '\n}')
    else:
        sel, body = blk.split('{', 1)
        if keep(sel):
            out.append(scope(sel.strip()) + ' {' + body)

def data_uri(path):
    mime = {'jpg': 'image/jpeg', 'png': 'image/png'}[path.rsplit('.', 1)[1]]
    return 'data:%s;base64,%s' % (mime, base64.b64encode(open(os.path.join(here, path), 'rb').read()).decode())
main = main.replace('img/bonaccorso-lab-navy.svg', data_uri('img/bonaccorso-lab-navy-web.png'))
main = main.replace('img/prelievo.jpg', data_uri('img/prelievo.jpg'))

base = '''.bl-page { --navy:#3a5881; --slate:#7f97ba; --mid:#a9bcd4; --powder:#e5edf8; --testo:#3a5881; --bianco:#fff;
  font-family:"Jost","Helvetica Neue",Arial,sans-serif; color:var(--testo); font-size:16px; line-height:1.6; }
.bl-page * { box-sizing:border-box; margin:0; padding:0; }
.bl-page img { display:block; max-width:100%; }
.bl-page a { color:inherit; }
.bl-page h1, .bl-page h2, .bl-page h3, .bl-page p, .bl-page li, .bl-page a, .bl-page b { font-family:inherit; }
.bl-page h1, .bl-page h2, .bl-page h3 { margin:0; letter-spacing:normal; }
'''
snippet = '''<!-- BONACCORSO LAB – pagina servizio. Incollare tutto in un widget "HTML" di Elementor (pagina a larghezza piena). -->
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
%s%s
</style>
<div class="bl-page">
%s
</div>
''' % (base, '\n'.join(out), main.strip())
open(os.path.join(here, 'wordpress-bonaccorso-lab.html'), 'w', encoding='utf-8').write(snippet)
print(len(snippet), 'caratteri')
