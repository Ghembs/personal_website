# Third-party notices

## shan-shui-inf

`public/shanshui.js` ports and simplifies drawing algorithms (brush stroke,
mountains and plateaus, texture, the eight trees, water, boat, buildings, the
pylon, figures with their hats and staff) from
[shan-shui-inf](https://github.com/LingDong-/shan-shui-inf) by Lingdong Huang.

```
MIT License

Copyright (c) 2018 Lingdong Huang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## creative-coding-domestika-2022

The tunnel's rectangle style in `public/kaleido.js` (riso inks, offset shadow,
double stroke) follows the "skew" sketch in
[creative-coding-domestika-2022](https://github.com/brunoimbrizi/creative-coding-domestika-2022)
by Bruno Imbrizi.

```
MIT License

Copyright (c) 2023 Bruno Imbrizi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Chinese section data and font

`public/cinese/data` holds data derived from CC-CEDICT (CC BY-SA 4.0),
Make Me a Hanzi (LGPL-3.0) and Tatoeba sentences (CC BY 2.0 FR), plus lists
taken from the HSK syllabus; see
[public/cinese/data/LICENSES.md](public/cinese/data/LICENSES.md).
`public/cinese/fonts/hanzi.woff2` is a subset of Noto Serif SC
(SIL Open Font License, [public/cinese/fonts/OFL.txt](public/cinese/fonts/OFL.txt)).

## Runtime dependencies

- [p5.js](https://p5js.org) 1.11.1 (LGPL-2.1), loaded from cdnjs.
- [Babylon.js](https://www.babylonjs.com) 9.28.0 (Apache-2.0), loaded from jsDelivr.
- [Hanzi Writer](https://hanziwriter.org) 3.7.2 (MIT) and its stroke data
  `hanzi-writer-data` (Arphic Public License), loaded from jsDelivr.
- Fonts from Google Fonts (SIL Open Font License): JetBrains Mono, Space Grotesk,
  Unbounded, Cormorant Garamond, Ma Shan Zheng.

## audio-cmn

`public/cinese/audio/` holds recordings from
[audio-cmn](https://github.com/hugolpz/audio-cmn) (Hugo Lopez, PLIDAM, INALCO):
the Mandarin syllables read by Chen Wang and the HSK words and characters read
by Yue Tan, both under CC BY-SA, shared under the same licence. See
`public/cinese/audio/LICENSES.md`.
