var container;
var count = 0;
var camera, scene, renderer, particles, i, h, color;
var shaderMaterial, metalMaterial;
var mouseX = 0, mouseY = 0;
var flag;
var clock;
var suomiTexture, nitorTexture;
var suomiTextMesh, nitorTextMesh;
var logoMesh;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var color1 = new THREE.Color(0, 140 / 255, 186 / 255);
var color2 = new THREE.Color(1, 1, 1);
var color3 = new THREE.Color(1, 1.0, 0.2);

init();
animate();

function init() {
  THREE.ImageUtils.crossOrigin = '';
  container = document.createElement('div');
  container.id = 'fullscreen';
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  scene = new THREE.Scene();
  //scene.fog = new THREE.Fog(new THREE.Color(0.1, 0.1, 0.1), 1000, 9000);
  scene.background = new THREE.Color(0.1, 0.1, 0.1);

  clock = new THREE.Clock();
  clock.start();

  suomiTexture = THREE.ImageUtils.loadTexture('suomi.png');
  nitorTexture = THREE.ImageUtils.loadTexture('vuohi2.png');

  uniforms = {
    texture: { type: "t", value: suomiTexture },
    uColor1: { type: "3f", value: new THREE.Vector3(0, 0, 0) },
    uColor2: { type: "3f", value: new THREE.Vector3(0, 0, 0) },
    uColor3: { type: "3f", value: new THREE.Vector3(0, 0, 0) },
    uConstant: { type: "2f", value: new THREE.Vector2(0, 0) },
    uZoom: { type: "1f", value: 0.0 },
    uTime: { type: "1f", value: 0.0 },
    uScaler: { type: "1f", value: 0.0 }
  };

  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent
  });

  cubeCamera1 = new THREE.CubeCamera(1, 10000, 1024);
  cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  scene.add(cubeCamera1);

  cubeCamera2 = new THREE.CubeCamera(1, 10000, 1024);
  cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  scene.add(cubeCamera2);

  var planeGeometry = new THREE.PlaneGeometry(1800, 1100, 36, 22);
  var plane = new THREE.Mesh(planeGeometry, shaderMaterial);
  plane.rotation.x = -Math.PI * 0.5;
  plane.rotation.z = Math.PI;
  plane.position.y = -1000;
  scene.add(plane);
  flag = plane;

  var baseColor = new THREE.Color(0, 140 / 255, 186 / 255);
  var whiteColor = new THREE.Color(0.9, 0.9, 0.9);
  metalMaterial = new THREE.MeshStandardMaterial({
    color: whiteColor,
    //emissive: whiteColor,
    //emissiveIntensity: 0.1,
    envMap: cubeCamera2.renderTarget.texture,
    refractionRatio: 0.9,
    reflectivity: 0.9,
    metalness: 1.0,
    roughness: 0.2,
  });

  var loader = new THREE.FontLoader();
  loader.load('IndustryInc.json', function (font) {
    nitorTextGeo = new THREE.TextBufferGeometry('Nitor sqrt(100)', {
      font: font,
      size: 30,
      height: 2,
      curveSegments: 4,
      bevelThickness: 3,
      bevelSize: 4,
      bevelEnabled: true,
      material: 0,
      extrudeMaterial: 1
    });
    nitorTextGeo.computeBoundingBox();
    nitorTextGeo.computeVertexNormals();
    var centerOffset = 0.5 * (nitorTextGeo.boundingBox.max.x - nitorTextGeo.boundingBox.min.x);
    var halfHeight = 0.5 * (nitorTextGeo.boundingBox.max.y - nitorTextGeo.boundingBox.min.y);
    nitorTextMesh = new THREE.Mesh(nitorTextGeo, metalMaterial);
    nitorTextMesh.position.x = centerOffset;
    nitorTextMesh.position.y = 0;
    nitorTextMesh.position.z = -150-halfHeight;
    nitorTextMesh.startPosition = -150-halfHeight;
    nitorTextMesh.rotation.x = Math.PI * 0.5;
    nitorTextMesh.rotation.y = Math.PI;
    scene.add(nitorTextMesh);

    suomiTextGeo = new THREE.TextBufferGeometry('Suomi 100', {
      font: font,
      size: 30,
      height: 2,
      curveSegments: 4,
      bevelThickness: 5,
      bevelSize: 2,
      bevelEnabled: true,
      material: 0,
      extrudeMaterial: 1
    });
    suomiTextGeo.computeBoundingBox();
    suomiTextGeo.computeVertexNormals();
    var centerOffset = 0.5 * (suomiTextGeo.boundingBox.max.x - suomiTextGeo.boundingBox.min.x);
    var halfHeight = 0.5 * (suomiTextGeo.boundingBox.max.y - suomiTextGeo.boundingBox.min.y);
    suomiTextMesh = new THREE.Mesh(suomiTextGeo, metalMaterial);
    suomiTextMesh.position.x = centerOffset;
    suomiTextMesh.position.y = 0;//-900;
    suomiTextMesh.position.z = -150-halfHeight;
    suomiTextMesh.startPosition = -150-halfHeight;
    suomiTextMesh.rotation.x = Math.PI * 0.5;
    suomiTextMesh.rotation.y = Math.PI;
    suomiTextMesh.scale.x = suomiTextMesh.scale.y = suomiTextMesh.scale.z = 1.0;
    scene.add(suomiTextMesh);
  });

  var sphereGeom = new THREE.SphereBufferGeometry(100, 32, 16);

  var sphereMesh = new THREE.Mesh(sphereGeom, metalMaterial);
  sphereMesh.scale.x = sphereMesh.scale.y = sphereMesh.scale.z = 2.0;
  //scene.add(sphereMesh);

  var objLoader = new THREE.OBJLoader();

  objLoader.load(
    'nitor.obj',
    function (object) {
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = metalMaterial;
        }
      });
      object.rotation.x = Math.PI;
      object.rotation.z = Math.PI;
      logoMesh = object;
      //scene.add(object);
    });

  var ambientlight = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambientlight);

  var pointLight = new THREE.PointLight(0xe0f0ff, 1.0, 10000);
  pointLight.position.set(0, 200, 0);
  scene.add(pointLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.autoClear = false;
  //renderer.setFaceCulling(THREE.CullFaceNone);
  container.appendChild(renderer.domElement);

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function onDocumentMouseDown(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  if (event.button === 2) {
    requestFullscreen.call(target);
  }
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function goFullscreen(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  requestFullscreen.call(target);
  if (event) event.preventDefault();
}

function onDocumentTouchStart(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  if (event.touches.length == 2) {
    requestFullscreen.call(target);
  } else if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onWindowResize(event) {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  var t = clock.getElapsedTime();

  var a = 0;//2 * mouseX / windowHalfX;
  var b = 0;//2 * mouseY / windowHalfY;
  var x = 0.0;
  var y = 500;
  var z = 1000 * b;

  camera.position.x = x * Math.cos(a) - y * Math.sin(a);
  camera.position.y = - x * Math.sin(a) + y * Math.cos(a);
  camera.position.z = z;

  camera.lookAt(scene.position);
  camera.rotation.order = 'XYZ';
  camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), a / 10.0);
  camera.up = new THREE.Vector3(0, 0, 1);

  render();
}

function render() {
  var t = clock.getElapsedTime();

  if (suomiTextMesh && nitorTextMesh) {
    suomiTextMesh.visible = false;
    nitorTextMesh.visible = false;
    if (count % 2 === 0) {
      metalMaterial.envMap = cubeCamera1.renderTarget.texture;
      metalMaterial.envMap.mapping = THREE.CubeRefractionMapping;
      cubeCamera2.position = suomiTextMesh.position;
      cubeCamera2.update(renderer, scene);
    } else {
      metalMaterial.envMap = cubeCamera2.renderTarget.texture;
      metalMaterial.envMap.mapping = THREE.CubeRefractionMapping;
      cubeCamera1.position = suomiTextMesh.position;
      cubeCamera1.update(renderer, scene);
    }

    var length = 1000;
    var speed = 1000 / length;
    if (suomiTextMesh && nitorTextMesh) {
      if (count % length < 0.5 * length) {
        shaderMaterial.uniforms.texture.value = suomiTexture;
        suomiTextMesh.visible = true;
        nitorTextMesh.visible = false;
        //suomiTextMesh.rotation.x = 10.0 * (count % length) / length * Math.PI * 2;
        //suomiTextMesh.position.z = -speed * (count % length) - suomiTextMesh.startPosition - 50;
      } else {
        shaderMaterial.uniforms.texture.value = nitorTexture;
        nitorTextMesh.visible = true;
        suomiTextMesh.visible = false;
        //nitorTextMesh.position.z = -speed * ((count - 0.5 * length) % length) - nitorTextMesh.startPosition - 50;
      }
    }
  }

  ++count;

  var speed = 0.1;
  shaderMaterial.uniforms.uColor1.value = color1;
  shaderMaterial.uniforms.uColor2.value = color2;
  shaderMaterial.uniforms.uColor3.value = color3;
  var scaler = Math.sin(t * 0.1 * speed) * Math.sin(t * 0.1 * speed);
  shaderMaterial.uniforms.uConstant.value = 1.0;
  shaderMaterial.uniforms.uZoom.value = 1.0;
  shaderMaterial.uniforms.uScaler.value = scaler;
  shaderMaterial.uniforms.uTime.value = t;

  renderer.render(scene, camera);
}

function initFullscreen() {
  var gofull = document.getElementById('gofull');
  if (gofull) {
    gofull.addEventListener('mousedown', goFullscreen);
    gofull.addEventListener('touchstart', goFullscreen);
  } else {
    setTimeout(initFullscreen, 500);
  }
}

initFullscreen();
