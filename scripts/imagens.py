#!/usr/bin/env python3
"""Imagens do site da Love Light & Soul: versões para a web, cartões de partilha e ícones.

Lê:
  media/fotos/*.jpg            as fotografias (as das peças são <peça>-<n>.jpg; as das categorias e ocasiões
                               categoria-<slug>.jpg e ocasiao-<slug>.jpg)
  media/marca/logo-dourado.png o logótipo inteiro, dourado, sem o fundo moca (o desenho deles, só recortado:
                               _cliente/ferramentas/logo-recorte.py); IGUAL ao original só sobre o moca #9C6D5D
  media/marca/logo-palavra.png «Love Light & Soul» (o mesmo recorte, sem a vela nem a linha de baixo)
  media/marca/logo-vela.png    a vela de um só traço (para os ícones)
  content/produtos/*.json      para saber a primeira fotografia de cada peça (o cartão de partilha)

Escreve em .cache/imagens/ (fica entre publicações; cada ficheiro leva no nome um resumo do original, por isso
só se refaz o que mudou) e .cache/imagens/manifesto.json, que o scripts/build.mjs lê.

    python3 scripts/imagens.py
"""
import glob
import hashlib
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageOps, features

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FOTOS = os.path.join(RAIZ, 'media', 'fotos')
MARCA = os.path.join(RAIZ, 'media', 'marca')
PRODUTOS = os.path.join(RAIZ, 'content', 'produtos')
CACHE = os.path.join(RAIZ, '.cache', 'imagens')

LARGURAS = [360, 540, 720, 960, 1280, 1600]
QUALIDADE_AVIF = 52
QUALIDADE_WEBP = 78
PARTILHA = (1200, 630)
MOCA = (0x9C, 0x6D, 0x5D)       # o fundo do logótipo, medido no ficheiro deles
CREME = (0xF8, 0xF2, 0xEB)
FORMATOS = ('avif', 'webp') if features.check('avif') else ('webp',)
VERSAO = f'v1-{LARGURAS}-{QUALIDADE_AVIF}-{QUALIDADE_WEBP}-{PARTILHA}'


def resumo(*caminhos, extra=''):
    h = hashlib.sha256((VERSAO + extra).encode())
    for c in caminhos:
        with open(c, 'rb') as f:
            h.update(f.read())
    return h.hexdigest()[:10]


def abrir(caminho):
    return ImageOps.exif_transpose(Image.open(caminho))


def guardar(im, destino, formato):
    if os.path.exists(destino):
        return
    tmp = destino + '.tmp'
    if formato == 'avif':
        im.save(tmp, 'AVIF', quality=QUALIDADE_AVIF, speed=6)
    elif formato == 'webp':
        im.save(tmp, 'WEBP', quality=QUALIDADE_WEBP, method=6)
    elif formato == 'png':
        im.save(tmp, 'PNG', optimize=True)
    else:
        im.save(tmp, 'JPEG', quality=86, optimize=True, progressive=True, subsampling=0)
    os.replace(tmp, destino)


def versoes(nome, origem):
    """AVIF + WebP nas larguras que a fotografia aguenta (nunca se aumenta)."""
    im = abrir(origem).convert('RGB')
    h = resumo(origem)
    larguras = [w for w in LARGURAS if w < im.width] + [im.width]
    for w in larguras:
        alto = round(im.height * w / im.width)
        reduzida = im if w == im.width else im.resize((w, alto), Image.LANCZOS)
        for fmt in FORMATOS:
            guardar(reduzida, os.path.join(CACHE, f'{nome}-{h}-{w}.{fmt}'), fmt)
    return {'largura': im.width, 'altura': im.height, 'resumo': h, 'larguras': larguras, 'formatos': list(FORMATOS)}


def cartao_produto(nome, origem):
    """Cartão de partilha de uma peça: a fotografia num quadrado ao centro, sobre o creme. O WhatsApp mostra a
    miniatura quadrada cortada ao centro (x 285–915 num 1200×630): a peça cabe aí inteira."""
    h = resumo(origem, __file__, extra='cartao')
    destino = os.path.join(CACHE, f'{nome}-{h}-partilha.jpg')
    if not os.path.exists(destino):
        im = abrir(origem).convert('RGB')
        lado = PARTILHA[1]
        menor = min(im.width, im.height)
        x, y = (im.width - menor) // 2, (im.height - menor) // 2
        quadrado = im.crop((x, y, x + menor, y + menor)).resize((lado, lado), Image.LANCZOS)
        cartao = Image.new('RGB', PARTILHA, CREME)
        cartao.paste(quadrado, ((PARTILHA[0] - lado) // 2, 0))
        guardar(cartao, destino, 'jpg')
    return os.path.basename(destino)


def cartao_logotipo(logo):
    """O cartão da página inicial e das páginas gerais: o logótipo deles, dourado sobre o moca deles, ao centro
    (nunca aumentado)."""
    h = resumo(logo, __file__, extra='cartao-logo')
    destino = os.path.join(CACHE, f'love-light-soul-{h}-partilha.jpg')
    if not os.path.exists(destino):
        marca = Image.open(logo).convert('RGBA')
        alto = min(430, marca.height)
        largo = round(marca.width * alto / marca.height)
        marca = marca.resize((largo, alto), Image.LANCZOS)
        cartao = Image.new('RGBA', PARTILHA, MOCA + (255,))
        cartao.alpha_composite(marca, ((PARTILHA[0] - largo) // 2, (PARTILHA[1] - alto) // 2))
        guardar(cartao.convert('RGB'), destino, 'jpg')
    return os.path.basename(destino)


def marca():
    """O logótipo (inteiro e só a palavra) em PNG e WebP a várias alturas, e os ícones (a vela de um só traço sobre
    o moca, num quadrado de cantos redondos)."""
    saida = {'inteiro': {}, 'palavra': {}, 'icones': {}}
    for chave, ficheiro, alturas in (('inteiro', 'logo-dourado.png', (96, 128, 160, 200, 260)),
                                     ('palavra', 'logo-palavra.png', (24, 28, 32, 40, 48, 56, 64, 80))):
        origem = os.path.join(MARCA, ficheiro)
        h = resumo(origem, extra=chave)
        im = Image.open(origem).convert('RGBA')
        saida[chave] = {'w': im.width, 'h': im.height, 'resumo': h, 'altura': {}}
        for alto in alturas:
            for mult in (1, 2):
                a = min(alto * mult, im.height)
                l = round(im.width * a / im.height)
                r = im.resize((l, a), Image.LANCZOS)
                for fmt in ('webp', 'png'):
                    guardar(r, os.path.join(CACHE, f'{chave}-{h}-{a}.{fmt}'), fmt)
            saida[chave]['altura'][alto] = {
                'largura': round(im.width * alto / im.height),
                '1x': f'{chave}-{h}-{min(alto, im.height)}', '2x': f'{chave}-{h}-{min(alto * 2, im.height)}'}
    vela = Image.open(os.path.join(MARCA, 'logo-vela.png')).convert('RGBA')
    hv = resumo(os.path.join(MARCA, 'logo-vela.png'), __file__, extra='icones')
    for px in (32, 48, 180, 192, 512):
        nome = f'icone-{hv}-{px}.png'
        destino = os.path.join(CACHE, nome)
        if not os.path.exists(destino):
            esc = 4  # desenha grande e reduz, para as orlas
            L = px * esc
            fundo = Image.new('RGBA', (L, L), (0, 0, 0, 0))
            raio = 0 if px == 180 else round(L * 0.22)   # o iOS arredonda o ícone sozinho
            ImageDraw.Draw(fundo).rounded_rectangle((0, 0, L - 1, L - 1), radius=raio, fill=MOCA + (255,))
            alvo = round(L * (0.78 if px <= 48 else 0.66))
            v = vela.copy()
            esc_v = alvo / max(v.width, v.height)
            v = v.resize((round(v.width * esc_v), round(v.height * esc_v)), Image.LANCZOS)
            if px <= 48:
                # nos ícones pequenos o traço de um pixel desaparece: engrossa-se o MESMO desenho (dilatação do alfa)
                alfa = v.getchannel('A').filter(ImageFilter.MaxFilter(9))
                v = Image.new('RGBA', v.size, (0xF1, 0xC7, 0xAE, 255))   # a cor do traço da vela, medida no logótipo
                v.putalpha(alfa)
            fundo.alpha_composite(v, ((L - v.width) // 2, (L - v.height) // 2 - round(L * 0.01)))
            img = fundo.resize((px, px), Image.LANCZOS)
            guardar(img if px != 180 else img.convert('RGB'), destino, 'png')
        saida['icones'][px] = nome
    return saida


def principal():
    os.makedirs(CACHE, exist_ok=True)
    manifesto = {'fotos': {}, 'partilha': {}, 'marca': None}
    origens = {}
    for f in sorted(os.listdir(FOTOS)):
        nome, ext = os.path.splitext(f)
        if ext.lower() not in ('.jpg', '.jpeg', '.png'):
            continue
        origens[nome] = os.path.join(FOTOS, f)
        manifesto['fotos'][nome] = versoes(nome, origens[nome])
    for f in sorted(glob.glob(os.path.join(PRODUTOS, '*.json'))):
        slug = os.path.splitext(os.path.basename(f))[0]
        p = json.load(open(f, encoding='utf-8'))
        fotos = p.get('fotos') or []
        if fotos and fotos[0]['ficheiro'] in origens:
            manifesto['partilha'][slug] = cartao_produto(slug, origens[fotos[0]['ficheiro']])
    manifesto['marca'] = marca()
    manifesto['partilha']['_site'] = cartao_logotipo(os.path.join(MARCA, 'logo-dourado.png'))
    vivos = {'manifesto.json'}
    for nome, d in manifesto['fotos'].items():
        for w in d['larguras']:
            for fmt in d['formatos']:
                vivos.add(f'{nome}-{d["resumo"]}-{w}.{fmt}')
    vivos.update(manifesto['partilha'].values())
    for chave in ('inteiro', 'palavra'):
        for d in manifesto['marca'][chave]['altura'].values():
            for k in ('1x', '2x'):
                vivos.update([d[k] + '.webp', d[k] + '.png'])
    vivos.update(manifesto['marca']['icones'].values())
    for f in os.listdir(CACHE):
        if f not in vivos:
            os.remove(os.path.join(CACHE, f))
    with open(os.path.join(CACHE, 'manifesto.json'), 'w', encoding='utf-8') as f:
        json.dump(manifesto, f, ensure_ascii=False, indent=1)
    print(f'imagens: {len(manifesto["fotos"])} fotografias, {len(manifesto["partilha"])} cartões de partilha, formatos {FORMATOS}')


if __name__ == '__main__':
    principal()
