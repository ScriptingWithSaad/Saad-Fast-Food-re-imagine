"""Publish content-versioned CSS and JS so old browser caches cannot mix releases.

Run after editing stylesheet/style.css or script/*: python scripts/build_assets.py
The HTML and its generated assets must be committed/deployed together.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'site'


def emit(name, extension, content):
    content = content.replace('\r\n', '\n')
    version = hashlib.sha256(content.encode('utf-8')).hexdigest()[:12]
    filename = f'{name}.{version}.{extension}'
    (OUT / filename).write_text(content, encoding='utf-8', newline='\n')
    return filename


def build():
    OUT.mkdir(exist_ok=True)
    products = emit('products', 'mjs', (ROOT / 'script/products.mjs').read_text(encoding='utf-8'))
    cart_source = (ROOT / 'script/cart.mjs').read_text(encoding='utf-8').replace('./products.mjs', './' + products)
    cart = emit('cart', 'mjs', cart_source)
    app_source = (ROOT / 'script/script.js').read_text(encoding='utf-8').replace('./cart.mjs', './' + cart)
    app = emit('app', 'js', app_source)
    css = emit('style', 'css', (ROOT / 'stylesheet/style.css').read_text(encoding='utf-8'))
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    html, css_count = re.subn(r'(<link\s+rel="stylesheet"\s+href=")[^"]+("\s*/?>)', rf'\g<1>assets/site/{css}\2', html)
    html, js_count = re.subn(r'(<script\s+type="module"\s+src=")[^"]+("\s*></script>)', rf'\g<1>assets/site/{app}\2', html)
    if (css_count, js_count) != (1, 1):
        raise RuntimeError('Expected exactly one stylesheet and one module entry in index.html')
    (ROOT / 'index.html').write_text(html, encoding='utf-8', newline='\n')
    print(f'Published {css}, {app}, {cart}, {products}')


if __name__ == '__main__':
    build()
