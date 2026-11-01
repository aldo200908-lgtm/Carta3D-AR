"""Creates six original stylized, real-world-scale GLB dishes for the demo.
All geometry is generated here. No third-party 3D models or textures.
Coordinates follow glTF: +Y up. Units are metres.
"""
import os, math
import numpy as np
import trimesh
from PIL import Image, ImageDraw

ROOT=os.path.join(os.path.dirname(__file__), 'assets','models')
os.makedirs(ROOT,exist_ok=True)
np.random.seed(11)

COL={
 'plate': '#e7dfcb','plate_edge':'#c4b9a2','dark_plate':'#292a28',
 'dough':'#d8974e','bun':'#cb8240','bun_top':'#cc8e4d','burger':'#673722',
 'salad':'#77a24d','tomato':'#b83b29','cheese':'#f5b835','rice':'#f1eadc',
 'salmon':'#e57951','nori':'#202526','cream':'#e9dac1','chocolate':'#4b2a22',
 'basil':'#39784b','sauce':'#a83f2d','pasta':'#dfae4c',
}

def rgba(v):
 if isinstance(v,str): v=v.lstrip('#'); return list(bytes.fromhex(v))+[255]
 return list(v)

def add(sc,mesh,color, name=None):
 mesh.visual=trimesh.visual.ColorVisuals(mesh,vertex_colors=np.tile(rgba(color), (len(mesh.vertices),1)))
 sc.add_geometry(mesh,geom_name=name)

def trans(mesh,x=0,y=0,z=0):mesh.apply_translation([x,y,z]);return mesh

def cylinder(r,h,x,y,z,color,sc,sections=48):
 # mesh cylinder axis z by default, rotate into y
 m=trimesh.creation.cylinder(radius=r,height=h,sections=sections)
 m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
 add(sc,trans(m,x,y,z),color)

def ellipsoid(rx,ry,rz,x,y,z,color,sc,sub=2):
 m=trimesh.creation.icosphere(subdivisions=sub,radius=1)
 m.apply_scale([rx,ry,rz]);add(sc,trans(m,x,y,z),color)

def box(ext,x,y,z,color,sc,angle=0):
 m=trimesh.creation.box(extents=ext)
 if angle:m.apply_transform(trimesh.transformations.rotation_matrix(angle,[0,1,0]))
 add(sc,trans(m,x,y,z),color)

def disc_annulus(ro,ri,y,h,sc,color,n=72):
 # ring with caps
 coords=[];faces=[]
 for yy in [y-h/2,y+h/2]:
  for r in [ri,ro]:
   for i in range(n):
    t=i*2*math.pi/n
    coords.append([r*math.cos(t),yy,r*math.sin(t)])
 for layer in range(3):
  aa=layer*n;bb=(layer+1)*n
  for i in range(n):
   j=(i+1)%n
   faces.extend([[aa+i,bb+i,aa+j],[aa+j,bb+i,bb+j]])
 for inner in [0,1]:
  aa=inner*n;bb=(inner+2)*n
  for i in range(n):
   j=(i+1)%n;faces.extend([[aa+i,bb+i,aa+j],[aa+j,bb+i,bb+j]])
 m=trimesh.Trimesh(vertices=coords,faces=faces,process=False)
 add(sc,m,color)

def plate(sc,dark=False,r=.167):
 c=COL['dark_plate'] if dark else COL['plate']
 cylinder(r*.87,.009,0,.0045,0,c,sc,64)
 disc_annulus(r,r*.80,.011,.010,sc,COL['plate_edge'] if not dark else '#3c3c38')
 cylinder(.135,.004,0,.013,0,c,sc,64)

def tube(points,r,sc,color,sides=6):
 pts=np.array(points)
 vertices=[];faces=[]
 for i,p in enumerate(pts):
  tangent=pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]
  tangent=tangent/(np.linalg.norm(tangent)+1e-8)
  ref=np.array([0.,1.,0.])
  normal=np.cross(tangent,ref)
  if np.linalg.norm(normal)<.001:normal=np.cross(tangent,np.array([1.,0.,0.]))
  normal=normal/(np.linalg.norm(normal)+1e-8)
  binormal=np.cross(tangent,normal)
  for j in range(sides):
   theta=2*math.pi*j/sides
   v=p+r*(math.cos(theta)*normal+math.sin(theta)*binormal)
   vertices.append(v)
  if i>0:
   for j in range(sides):
    a=(i-1)*sides+j;b=(i-1)*sides+(j+1)%sides
    c=i*sides+j;d=i*sides+(j+1)%sides
    faces.extend([[a,b,c],[b,d,c]])
 mesh=trimesh.Trimesh(vertices=vertices,faces=faces,process=False)
 add(sc,mesh,color)

def leaf(sc,x,y,z,size,angle=0,color=None):
 m=trimesh.creation.icosphere(subdivisions=1,radius=1)
 m.apply_scale([size, .0012, size*.47]);m.apply_transform(trimesh.transformations.rotation_matrix(angle,[0,1,0]));
 add(sc,trans(m,x,y,z),color or COL['basil'])

def seed(sc,x,y,z):
 m=trimesh.creation.icosphere(subdivisions=1,radius=1)
 m.apply_scale([.0033,.0013,.0016]);m.apply_transform(trimesh.transformations.rotation_matrix(np.random.uniform(-3,3),[0,1,0]));add(sc,trans(m,x,y,z),'#fff0c4')

def save(sc,name):
 filename=os.path.join(ROOT,name+'.glb')
 out=sc.export(file_type='glb');open(filename,'wb').write(out)
 print(name,len(out)//1024,'KB')

# PIZZA
sc=trimesh.Scene();plate(sc,True)
cylinder(.123,.013,0,.026,0,'#d59750',sc,72)
cylinder(.113,.003,0,.034,0,'#c35531',sc,72)
cylinder(.108,.0025,0,.037,0,'#e8b967',sc,72)
disc_annulus(.131,.111,.030,.015,sc,'#d9a164')
for i in range(14):
 t=2*math.pi*i/14+.13;r=.045+(i%4)*.017
 x=r*math.cos(t);z=r*math.sin(t)
 cylinder(.017,.002,x,.041,z,'#b84838',sc,24)
for i in range(17):
 t=np.random.rand()*math.tau;r=np.random.rand()*.10
 leaf(sc,r*math.cos(t),.044,r*math.sin(t),.010,np.random.uniform(-3,3),'#386c3c')
for i in range(10):
 t=np.random.rand()*math.tau;r=.03+np.random.rand()*.07
 ellipsoid(.008,.002,.008,r*math.cos(t),.044,r*math.sin(t),'#f4d999',sc,1)
save(sc,'pizza')

# BURGER
sc=trimesh.Scene();plate(sc,True)
# base bun
ellipsoid(.084,.018,.080,0,.032,0,'#d69a54',sc,2)
cylinder(.081,.018,0,.052,0,'#6d3b25',sc,48)
ellipsoid(.085,.012,.082,0,.065,0,'#509044',sc,2)
for i in range(9):
 t=i*math.tau/9
 ellipsoid(.019,.004,.009,.062*math.cos(t),.073,.058*math.sin(t),'#b52c22',sc,1)
# cheese and lettuce
box([.136,.007,.129],0,.080,0,'#f0b936',sc,angle=.34)
ellipsoid(.085,.010,.083,0,.088,0,'#8aab50',sc,2)
# top bun with layered ellipses
cylinder(.081,.012,0,.101,0,'#bc7737',sc,48)
ellipsoid(.083,.033,.081,0,.113,0,'#cb894a',sc,3)
for i in range(34):
 x=np.random.uniform(-.062,.062);z=np.random.uniform(-.059,.059)
 q=1-(x/.085)**2-(z/.083)**2
 if q>0:
  y=.113+.033*math.sqrt(q)
  seed(sc,x,y+.002,z)
save(sc,'burger')

# PASTA
sc=trimesh.Scene();plate(sc,True)
cylinder(.116,.009,0,.023,0,'#9d3b25',sc,56)
for i in range(46):
 rad=.020+(i%13)*.0055
 t0=i*2.4
 pts=[]
 for j in range(22):
  a=t0+j*.23
  rr=rad+(.005*math.sin(j*.45+i))
  y=.031+.005*(i%5)+.007*math.sin(j*.45+i*.5)+.009*(1-rr/.1)
  pts.append([rr*math.cos(a),y,rr*math.sin(a)])
 tube(pts,.0021,sc, '#e5b258' if i%4 else '#d89e48',sides=5)
for i in range(12):
 t=i*1.7;rr=.027+(i%5)*.012
 ellipsoid(.010,.006,.009,rr*math.cos(t),.054,rr*math.sin(t),'#b84230',sc,1)
for i in range(15):
 t=i*1.2;rr=.02+(i%6)*.009
 leaf(sc,rr*math.cos(t),.064,rr*math.sin(t),.007,t,color='#367246')
save(sc,'pasta')

# SUSHI
sc=trimesh.Scene();plate(sc,True)
# long slate rectangular platter
box([.264,.012,.160],0,.023,0,'#313533',sc)
for j in range(2):
 for i in range(4):
  x=-.089+i*.059;z=-.038+j*.069
  cylinder(.024,.022,x,.041,z,'#1d2829',sc,32)
  cylinder(.020,.021,x,.046,z,'#f3ebd9',sc,32)
  cylinder(.009,.024,x,.049,z,'#89ac62',sc,24)
  ellipsoid(.022,.008,.023,x,.063,z,'#e58455',sc,2)
for i in range(3):
 leaf(sc,-.125+i*.024,.032,.068,.018,i*.5,'#548351')
save(sc,'sushi')

# STEAK
sc=trimesh.Scene();plate(sc,False)
# steak oval and irregular overlapping sculpt
ellipsoid(.079,.020,.055,-.022,.038,.005,'#77412e',sc,3)
ellipsoid(.074,.013,.050,-.021,.053,.003,'#a65837',sc,3)
for i in range(5):
 x=-.065+i*.020
 tube([[x-.020,.063,-.035],[x-.007,.065,-.012],[x+.011,.064,.012],[x+.024,.062,.033]],.002,sc,'#4a2b26',sides=5)
# asparagus x=0.09
for i in range(6):
 z=-.063+i*.022
 tube([[.068,.029,z],[.091,.036,z+.003],[.118,.043,z-.004]],.004,sc,'#497447',sides=6)
 ellipsoid(.007,.005,.007,.117,.043,z-.004,'#688a3e',sc,1)
# roasted potatoes
for i in range(5):
 t=i*math.tau/5
 ellipsoid(.018,.011,.015,.035+.027*math.cos(t),.034,.051+.025*math.sin(t),'#d3a154',sc,1)
save(sc,'steak')

# CAKE
sc=trimesh.Scene();plate(sc,False)
# cake wedge extrusion
verts2d=[(-.065,-.049),(.063,-.004),(-.065,.055)]
def wedge(yy,h,color):
 top=[[x,yy+h/2,z] for x,z in verts2d]
 bot=[[x,yy-h/2,z] for x,z in verts2d]
 ver=bot+top;fac=[[0,2,1],[3,4,5]]
 for i in range(3):
  j=(i+1)%3;fac.extend([[i,j,i+3],[j,j+3,i+3]])
 add(sc,trimesh.Trimesh(vertices=ver,faces=fac,process=False),color)
wedge(.032,.021,'#513024');wedge(.047,.009,'#cbb3a0');wedge(.061,.021,'#4d281f');wedge(.076,.009,'#d8bba8');wedge(.088,.014,'#583127')
ellipsoid(.019,.009,.018,-.037,.100,-.006,'#c6312e',sc,2)
for a in [0,2.1,4.1]:leaf(sc,-.038,.110,-.007,.011,a,'#487a3e')
ellipsoid(.027,.022,.029,.072,.034,.046,'#f5ebd2',sc,2)
for i in range(9):
 t=i*math.tau/9
 ellipsoid(.004,.003,.005,.072+.017*math.cos(t),.054,.045+.017*math.sin(t),'#a24e32',sc,1)
save(sc,'cake')
