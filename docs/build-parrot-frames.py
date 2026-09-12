from PIL import Image, ImageDraw
import numpy as np, os
from scipy import ndimage

A = np.asarray(Image.open('sheet-clean.png').convert('RGBA')).copy()
POSES = [
 ('fly_raised',   (124,707,406,453), False),
 ('fly_down',     (583,801,415,328), False),
 ('fly_low',      (985,790,408,377), False),
 ('perched_calm', (197,145,336,492), True),
 ('perched_preen',(1075,143,310,486), True),
 ('perched_look', (673,133,292,503), True),
]
def clean(sub):
    al = sub[...,3].copy(); solid = al > 100
    lbl,n = ndimage.label(solid)
    if n > 1:
        sizes = ndimage.sum(solid, lbl, range(1,n+1))
        solid = lbl == int(np.argmax(sizes))+1
    core = ndimage.binary_opening(solid, structure=np.ones((9,9)))
    core = ndimage.binary_propagation(core, mask=solid)
    al[~core] = 0
    sub = sub.copy(); sub[...,3] = al
    return sub
def anchors(sub):
    rgb = sub[...,:3].astype(int); m = sub[...,3] > 128
    R,G,B = rgb[...,0],rgb[...,1],rgb[...,2]
    brown = m&(R>95)&(R<175)&(G>60)&(G<130)&(B>35)&(B<105)&(R-B>30)&(R-G>18)&(G-B>10)
    cream = m&(R>222)&(G>210)&(B>185)&(R-B>10)&(R-B<45)
    def cen(k):
        ys,xs = np.nonzero(k)
        return (xs.mean(), ys.mean(), ys.max()) if len(xs)>50 else None
    return cen(brown), cen(cream)

CELL,COLS,ROWS = 720,3,2
FEET = (CELL*0.5, CELL*0.78)
crops=[]
for name,(x,y,w,h),mirror in POSES:
    img = Image.fromarray(clean(A[y:y+h,x:x+w]),'RGBA')
    if mirror: img = img.transpose(Image.FLIP_LEFT_RIGHT)
    img = img.crop(img.getbbox())
    f,c = anchors(np.asarray(img))
    crops.append(dict(name=name,img=img,feet=f,cream=c,perched=mirror))
ref=None
for c in crops:
    if c['perched']:
        c['offset']=(FEET[0]-c['feet'][0], FEET[1]-c['feet'][2])
        if c['name']=='perched_calm': ref=(c['cream'][0]+c['offset'][0], c['cream'][1]+c['offset'][1])
for c in crops:
    if not c['perched']: c['offset']=(ref[0]-c['cream'][0], ref[1]-c['cream'][1])

sheet = Image.new('RGBA',(CELL*COLS,CELL*ROWS),(0,0,0,0))
for i,c in enumerate(crops):
    col,row=i%COLS,i//COLS
    sheet.paste(c['img'],(int(round(col*CELL+c['offset'][0])),int(round(row*CELL+c['offset'][1]))),c['img'])
FINAL=320
sheet = sheet.resize((FINAL*COLS,FINAL*ROWS), Image.LANCZOS)
sheet.save('parrot-frames.png', optimize=True)
print('лента %s, %d КБ' % (sheet.size, os.path.getsize('parrot-frames.png')//1024))
# точка опоры лап в долях ячейки — понадобится коду
print('лапы в ячейке: x %.3f, y %.3f' % (FEET[0]/CELL, FEET[1]/CELL))
prev = Image.new('RGB',sheet.size,(246,239,225)); prev.paste(sheet,(0,0),sheet)
d=ImageDraw.Draw(prev)
for k in range(1,COLS): d.line([(k*FINAL,0),(k*FINAL,sheet.height)],fill=(205,185,155))
for k in range(1,ROWS): d.line([(0,k*FINAL),(sheet.width,k*FINAL)],fill=(205,185,155))
for i in range(6): d.text(((i%COLS)*FINAL+8,(i//COLS)*FINAL+6),str(i),fill=(150,60,40))
prev.save('frames-preview.png')
