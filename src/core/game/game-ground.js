/* eslint-disable no-param-reassign */
import {
  MeshPhongMaterial,
  PlaneGeometry,
  Mesh,
  BoxGeometry,
} from 'three';

export default scene => new Promise((res) => {
  const ground = new MeshPhongMaterial({
    color: 0x826a40,
    flatShading: true,
    wireframe: false,
  });

  const planeGeo = new PlaneGeometry(50, 40, 40, 40);
  // console.log(planeGeo.vertices);

  const planeMesh = new Mesh(planeGeo, ground);
  planeMesh.rotation.x = -Math.PI / 2;
  planeMesh.rotation.z = -Math.PI / 2;
  planeMesh.position.y = -0.2;
  planeMesh.position.z = -10;
  planeMesh.receiveShadow = true;
  scene.add(planeMesh);

  // let roadGeo = new PlaneGeometry(5, 50, 2, 2);
  const roadGeo = new BoxGeometry(5, 50, 1);
  const roadMesh = new Mesh(roadGeo, new MeshPhongMaterial({ color: 0x4f4027 }));
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.rotation.z = -Math.PI / 2;
  roadMesh.position.y = -0.5;
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  res({ g: planeGeo, m: planeMesh });
});
