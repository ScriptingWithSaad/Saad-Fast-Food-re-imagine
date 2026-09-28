import contextlib
import importlib.util
import io
import re
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_assets', ROOT / 'scripts/build_assets.py')
build_assets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build_assets)


class CacheVersionTests(unittest.TestCase):
    def test_changes_invalidate_the_right_assets_and_retain_previous_versions(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for name in ('script', 'stylesheet'):
                shutil.copytree(ROOT / name, root / name)
            shutil.copy(ROOT / 'index.html', root / 'index.html')
            (root / 'assets').mkdir()
            with patch.object(build_assets, 'ROOT', root), patch.object(build_assets, 'OUT', root / 'assets/site'):
                def build():
                    with contextlib.redirect_stdout(io.StringIO()):
                        build_assets.build()
                    return re.findall(r'assets/site/[^"\s]+', (root / 'index.html').read_text(encoding='utf-8'))

                first = build()
                self.assertEqual(first, build(), 'Unchanged sources must produce identical filenames')
                with (root / 'stylesheet/style.css').open('a', encoding='utf-8') as f:
                    f.write('\n.site-header { border-bottom-color: red; }\n')
                css_changed = build()
                self.assertNotEqual(first[0], css_changed[0])
                self.assertEqual(first[1], css_changed[1])
                with (root / 'script/products.mjs').open('a', encoding='utf-8') as f:
                    f.write('\n// Catalogue revision\n')
                data_changed = build()
                self.assertNotEqual(css_changed[1], data_changed[1], 'Version must propagate through module imports')
                for old in first:
                    self.assertTrue((root / old).is_file(), 'Previously cached HTML must retain its assets')
                app = (root / data_changed[1]).read_text(encoding='utf-8')
                cart_name = re.search(r'\./(cart\.[a-f0-9]+\.mjs)', app)[1]
                cart = (root / 'assets/site' / cart_name).read_text(encoding='utf-8')
                products_name = re.search(r'\./(products\.[a-f0-9]+\.mjs)', cart)[1]
                self.assertIn('Catalogue revision', (root / 'assets/site' / products_name).read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
