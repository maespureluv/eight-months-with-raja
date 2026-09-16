import * as T from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
const host=document.getElementById('proposalScene');
let renderer,scene,camera,world,lid,ring,ringHome,glint,loading;
const parts=[];
const ease=(t,a,b)=>{const x=T.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)};
function split(mesh,upper){
 const src=mesh.geometry.toNonIndexed(),attrs={},p=src.attributes.position;
 for(const name in src.attributes)attrs[name]=[];
 for(let i=0;i<p.count;i+=3){if((Math.max(p.getY(i),p.getY(i+1),p.getY(i+2))>3)!==upper)continue;
 for(const [name,a] of Object.entries(src.attributes))for(let j=0;j<3;j++)for(let k=0;k<a.itemSize;k++)attrs[name].push(a.array[(i+j)*a.itemSize+k]);}
 const geo=new T.BufferGeometry();for(const [name,v]of Object.entries(attrs))geo.setAttribute(name,new T.Float32BufferAttribute(v,src.attributes[name].itemSize));src.dispose();return new T.Mesh(geo,mesh.material.clone());
}
async function load(){
 renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;renderer.domElement.className='model-canvas';host.appendChild(renderer.domElement);
 scene=new T.Scene();camera=new T.PerspectiveCamera(36,1,.1,1000);
 const env=new T.PMREMGenerator(renderer);scene.environment=env.fromScene(new RoomEnvironment(),.04).texture;env.dispose();scene.add(new T.HemisphereLight(0xfff3fb,0x80607b,2));const light=new T.DirectionalLight(0xffefd4,3);light.position.set(30,90,80);scene.add(light);
 const loader=new GLTFLoader();let gltf;
 if(location.protocol==='file:'){
 await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='models/model-local.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
 const bytes=Uint8Array.from(atob(window.anniversaryModelData),c=>c.charCodeAt(0));gltf=await loader.parseAsync(bytes.buffer,'');delete window.anniversaryModelData;
 }else gltf=await loader.loadAsync('models/engagement_ring_box.glb');
 world=gltf.scene;scene.add(world);world.updateMatrixWorld(true);
 const mesh=world.getObjectByName('Box_Box_0'),parent=mesh.parent,base=split(mesh,false),top=split(mesh,true);parent.remove(mesh);parent.add(base);lid=new T.Group();lid.position.set(-10,0,-16);parent.add(lid);top.position.copy(lid.position).negate();lid.add(top);lid.attach(world.getObjectByName('Light'));
 ring=new T.Group();scene.add(ring);for(const name of ['Diamond_Heart','Diamond1','Ring_Heart'])ring.attach(world.getObjectByName(name));ringHome=new T.Box3().setFromObject(ring).getCenter(new T.Vector3());for(const c of ring.children)c.position.sub(ringHome);ring.position.copy(ringHome);
 world.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.side=T.DoubleSide;parts.push(o);}});
 ring.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.name.includes('Diamond'))o.material=new T.MeshPhysicalMaterial({color:0xe6faff,metalness:.15,roughness:.06,transmission:.25,thickness:1.5,ior:2.4,envMapIntensity:2.5});else{o.material.color.set(0xf3ce77);o.material.metalness=1;o.material.roughness=.2;o.material.envMapIntensity=2.5;}}});
 const star=document.createElement('canvas');star.width=64;star.height=64;const ctx=star.getContext('2d');ctx.fillStyle='white';ctx.beginPath();for(const [i,p]of [[32,0],[38,25],[64,32],[38,39],[32,64],[25,39],[0,32],[25,25]].entries()){if(!i)ctx.moveTo(...p);else ctx.lineTo(...p);}ctx.closePath();ctx.fill();
 glint=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(star),transparent:true,depthTest:false,blending:T.AdditiveBlending}));ring.updateMatrixWorld(true);const gem=new T.Box3().setFromObject(ring.getObjectByName('Diamond_Heart')).getCenter(new T.Vector3());glint.position.copy(ring.worldToLocal(gem));glint.position.y+=2;ring.add(glint);
 function resize(){const w=host.clientWidth||innerWidth,h=(host.clientHeight||innerHeight)*.76;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);resize();host.classList.add('model-ready');
}
window.prepareRingModel=()=>loading??=(load().catch(e=>{renderer?.domElement.remove();loading=undefined;throw e;}));
window.startRingModel=async(audio,onFinish)=>{
 await window.prepareRingModel();host.classList.remove('hidden');host.classList.add('model-active');

 let t=0,previous=performance.now(),played=false,preview=false;audio.currentTime=0;try{await audio.play();played=true;}catch{}previous=performance.now();
 const question=host.querySelector('.proposal-question'),one=host.querySelector('.note-one'),two=host.querySelector('.note-two');
 function renderTime(t){
 const entrance=ease(t,0,1.2),turn=ease(t,1,5.5),settle=ease(t,5.6,7.7),open=ease(t,6.0,8.0),rise=ease(t,7.9,9.5),glide=ease(t,13.5,15.7),close=ease(t,11,13.5),fade=ease(t,13.5,15),zoom=ease(t,21.8,23.4),face=ease(t,20.2,21.8),near=ease(t,9.5,11.3);
 world.position.y=-22*(1-entrance);world.rotation.y=Math.PI-.18+turn*2*Math.PI+settle*Math.PI;lid.rotation.x=1.4*(1-open)+1.4*close;for(const o of parts)o.material.opacity=1-fade;
 ring.visible=t>=7.9;ring.position.copy(ringHome);ring.position.y+=rise*32+(rise===1?Math.sin((t-9.5)*Math.PI/2)*1.2*(1-face):0)-glide*10;
 ring.position.x-=glide*(innerWidth<600?8:30);ring.scale.setScalar((1+near*.65+glide*.45)*(1+.1*rise));
 const spin=ease(t,9.5,20.2)*2*Math.PI;
 ring.quaternion.setFromEuler(new T.Euler(.12*Math.sin(spin),spin,0));
 camera.position.set(105,88,185).lerp(new T.Vector3(72,65,125),near);
 const direction=camera.position.clone().sub(ring.position).normalize();
 const facing=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,.936,.351).normalize(),direction);
 ring.quaternion.slerp(facing,face);
 glint.material.opacity=.2+.65*Math.pow(Math.max(0,Math.sin(t*3.4)),8);glint.scale.setScalar(2+glint.material.opacity*3);
 const show=(el,o)=>{el.style.opacity=o;el.style.transform=`translateY(${(1-o)*12}px)`;};
 show(question,ease(t,7.9,8.6)*(1-ease(t,12,13)));show(one,ease(t,13.7,14.8)*(1-ease(t,17.1,17.9)));show(two,ease(t,18,19)*(1-ease(t,20.2,21.5)));
 const target=new T.Vector3(-10,16,0).lerp(new T.Vector3(-10,27,0),near);
 ring.updateMatrixWorld(true);
 const gem=new T.Box3().setFromObject(ring.getObjectByName('Diamond_Heart')).getCenter(new T.Vector3());
 camera.position.lerp(gem.clone().add(direction.multiplyScalar(7)),zoom);target.lerp(gem,zoom);camera.lookAt(target);
 renderer.domElement.style.opacity=1-ease(t,23,23.4);renderer.render(scene,camera);
 }
 // Deterministic scene inspection for local review; normal playback follows the audio.
 window.previewRingAt=(time)=>{preview=true;audio.pause();renderTime(time);};
 function draw(now){if(preview)return;const delta=(now-previous)/1000;previous=now;if(played&&!audio.ended)t=audio.currentTime;else t+=delta;renderTime(t);
 if(t<23.4)requestAnimationFrame(draw);else{host.classList.remove('model-active');onFinish();}}
 requestAnimationFrame(draw);
};
window.prepareRingModel().catch(()=>{});
