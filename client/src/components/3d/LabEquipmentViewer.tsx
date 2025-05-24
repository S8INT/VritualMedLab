import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LabEquipmentViewerProps {
  equipmentType: 'microscope' | 'centrifuge' | 'spectrophotometer' | 'pipette' | 'incubator';
  width?: number;
  height?: number;
  backgroundColor?: string;
  interactive?: boolean;
  onLoad?: () => void;
}

export function LabEquipmentViewer({
  equipmentType,
  width = 600,
  height = 400,
  backgroundColor = '#f5f5f5',
  interactive = true,
  onLoad
}: LabEquipmentViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationSpeed = useRef<number>(0.01);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setClearColor(new THREE.Color(backgroundColor), 1);
    renderer.shadowMap.enabled = true;
    
    // Clear container before appending
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create and add the 3D model based on equipment type
    createEquipmentModel(equipmentType);
    
    // Set up animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (modelRef.current && !isMouseDown.current) {
        // Auto-rotate if not being manually rotated
        modelRef.current.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Set up event listeners for interaction
    if (interactive && containerRef.current) {
      containerRef.current.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      containerRef.current.addEventListener('wheel', handleZoom);
    }
    
    // Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      
      if (interactive && containerRef.current) {
        containerRef.current.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        containerRef.current.removeEventListener('wheel', handleZoom);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [equipmentType, width, height, backgroundColor, interactive]);

  // Mouse event handlers for rotation
  const handleMouseDown = (e: MouseEvent) => {
    isMouseDown.current = true;
    mousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDown.current || !modelRef.current) return;
    
    const deltaX = e.clientX - mousePosition.current.x;
    const deltaY = e.clientY - mousePosition.current.y;
    
    modelRef.current.rotation.y += deltaX * rotationSpeed.current;
    modelRef.current.rotation.x += deltaY * rotationSpeed.current;
    
    mousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  // Zoom functionality
  const handleZoom = (e: WheelEvent) => {
    e.preventDefault();
    
    if (!cameraRef.current) return;
    
    // Adjust camera position for zoom effect
    const zoomSpeed = 0.1;
    cameraRef.current.position.z += e.deltaY * zoomSpeed * 0.01;
    
    // Limit zoom
    cameraRef.current.position.z = Math.max(2, Math.min(10, cameraRef.current.position.z));
  };

  // Create equipment 3D models
  const createEquipmentModel = (type: string) => {
    if (!sceneRef.current) return;
    
    // Remove existing model if any
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
    }
    
    const group = new THREE.Group();
    modelRef.current = group;
    
    switch (type) {
      case 'microscope':
        createMicroscopeModel(group);
        break;
      case 'centrifuge':
        createCentrifugeModel(group);
        break;
      case 'spectrophotometer':
        createSpectrophotometerModel(group);
        break;
      case 'pipette':
        createPipetteModel(group);
        break;
      case 'incubator':
        createIncubatorModel(group);
        break;
      default:
        createMicroscopeModel(group);
    }
    
    sceneRef.current.add(group);
    
    // Position the model
    group.position.set(0, -1, 0);
    
    if (onLoad) {
      onLoad();
    }
  };

  // Equipment model builders
  const createMicroscopeModel = (group: THREE.Group) => {
    // Base of microscope
    const baseGeometry = new THREE.BoxGeometry(2, 0.2, 1.5);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);
    
    // Stand/arm
    const standGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 16);
    const standMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.set(0, 0, 0);
    stand.castShadow = true;
    group.add(stand);
    
    // Eyepiece
    const eyepieceGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
    const eyepieceMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const eyepiece = new THREE.Mesh(eyepieceGeometry, eyepieceMaterial);
    eyepiece.position.set(0, 1.2, 0);
    eyepiece.rotation.x = Math.PI / 2;
    eyepiece.castShadow = true;
    group.add(eyepiece);
    
    // Objective lenses
    const objectiveHolder = new THREE.Group();
    objectiveHolder.position.set(0, 0.5, 0.5);
    
    const holderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const holderMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.rotation.x = Math.PI / 2;
    objectiveHolder.add(holder);
    
    // Add three objective lenses
    const lensPositions = [
      new THREE.Vector3(0, 0, 0.25),
      new THREE.Vector3(0.2, 0, 0.15),
      new THREE.Vector3(-0.2, 0, 0.15)
    ];
    
    lensPositions.forEach((pos, i) => {
      const lensGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 16);
      const lensMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
      const lens = new THREE.Mesh(lensGeometry, lensMaterial);
      lens.position.copy(pos);
      lens.rotation.x = Math.PI / 2;
      lens.castShadow = true;
      objectiveHolder.add(lens);
      
      // Lens glass (end of each objective)
      const glassGeometry = new THREE.CircleGeometry(0.05, 16);
      const glassMaterial = new THREE.MeshPhongMaterial({ color: 0x88ccff, shininess: 100 });
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.set(pos.x, pos.y, pos.z + 0.15);
      glass.rotation.x = Math.PI / 2;
      objectiveHolder.add(glass);
    });
    
    group.add(objectiveHolder);
    
    // Stage
    const stageGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2);
    const stageMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, 0, 0.6);
    stage.castShadow = true;
    stage.receiveShadow = true;
    group.add(stage);
    
    // Focus knobs
    const knobGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
    const knobMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    
    const knob1 = new THREE.Mesh(knobGeometry, knobMaterial);
    knob1.position.set(0.4, 0, 0);
    knob1.rotation.z = Math.PI / 2;
    knob1.castShadow = true;
    group.add(knob1);
    
    const knob2 = new THREE.Mesh(knobGeometry, knobMaterial);
    knob2.position.set(-0.4, 0, 0);
    knob2.rotation.z = Math.PI / 2;
    knob2.castShadow = true;
    group.add(knob2);
    
    // Light source at the bottom
    const lightBaseGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.2, 16);
    const lightBaseMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const lightBase = new THREE.Mesh(lightBaseGeometry, lightBaseMaterial);
    lightBase.position.set(0, -0.8, 0.6);
    lightBase.castShadow = true;
    group.add(lightBase);
    
    // Add a point light to simulate the microscope's light
    const microscopeLight = new THREE.PointLight(0xffffcc, 0.5, 3);
    microscopeLight.position.set(0, -0.5, 0.6);
    group.add(microscopeLight);
  };

  const createCentrifugeModel = (group: THREE.Group) => {
    // Base unit
    const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.8, 32);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);
    
    // Top lid
    const lidGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32);
    const lidMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 0.45;
    lid.castShadow = true;
    group.add(lid);
    
    // Centrifuge rotor
    const rotorGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32);
    const rotorMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
    const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
    rotor.position.y = 0.2;
    rotor.castShadow = true;
    group.add(rotor);
    
    // Sample holders
    const holderPositions = [
      new THREE.Vector3(0.5, 0.25, 0),
      new THREE.Vector3(-0.5, 0.25, 0),
      new THREE.Vector3(0, 0.25, 0.5),
      new THREE.Vector3(0, 0.25, -0.5),
      new THREE.Vector3(0.35, 0.25, 0.35),
      new THREE.Vector3(-0.35, 0.25, 0.35),
      new THREE.Vector3(0.35, 0.25, -0.35),
      new THREE.Vector3(-0.35, 0.25, -0.35)
    ];
    
    holderPositions.forEach(pos => {
      const holderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16);
      const holderMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const holder = new THREE.Mesh(holderGeometry, holderMaterial);
      holder.position.copy(pos);
      holder.castShadow = true;
      group.add(holder);
      
      // Sample tube
      const tubeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
      const tubeMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.7 
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      tube.position.set(pos.x, pos.y + 0.15, pos.z);
      tube.castShadow = true;
      group.add(tube);
      
      // Colored liquid in tube
      const liquidGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 16);
      const liquidMaterial = new THREE.MeshPhongMaterial({ 
        color: Math.random() > 0.5 ? 0xff8866 : 0x88aaff
      });
      const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
      liquid.position.set(pos.x, pos.y + 0.05, pos.z);
      group.add(liquid);
    });
    
    // Control panel
    const panelGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.4);
    const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(0, -0.1, -1);
    panel.castShadow = true;
    group.add(panel);
    
    // Buttons and display
    const displayGeometry = new THREE.PlaneGeometry(0.5, 0.1);
    const displayMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, -0.05, -0.8);
    display.rotation.x = -Math.PI / 4;
    group.add(display);
    
    // Add a few control buttons
    [-0.2, 0, 0.2].forEach((x, i) => {
      const buttonGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
      const buttonMaterial = new THREE.MeshPhongMaterial({ 
        color: i === 0 ? 0xff0000 : i === 1 ? 0x00ff00 : 0x0000ff 
      });
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.set(x, -0.05, -0.7);
      button.rotation.x = Math.PI / 2;
      group.add(button);
    });
  };

  const createSpectrophotometerModel = (group: THREE.Group) => {
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Sample chamber
    const chamberGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.6);
    const chamberMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
    chamber.position.set(0, 0.4, 0);
    chamber.castShadow = true;
    group.add(chamber);
    
    // Display screen
    const screenGeometry = new THREE.PlaneGeometry(0.8, 0.3);
    const screenMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x88aaff,
      emissive: 0x88aaff,
      emissiveIntensity: 0.5
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(-0.5, 0.4, 0.51);
    screen.rotation.x = -Math.PI / 10;
    group.add(screen);
    
    // Control panel with buttons
    const panelGeometry = new THREE.PlaneGeometry(1, 0.4);
    const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(0.5, 0.1, 0.51);
    group.add(panel);
    
    // Add buttons to control panel
    const buttonPositions = [
      new THREE.Vector3(0.3, 0.2, 0.52),
      new THREE.Vector3(0.5, 0.2, 0.52),
      new THREE.Vector3(0.7, 0.2, 0.52),
      new THREE.Vector3(0.3, 0, 0.52),
      new THREE.Vector3(0.5, 0, 0.52),
      new THREE.Vector3(0.7, 0, 0.52)
    ];
    
    buttonPositions.forEach((pos, i) => {
      const buttonGeometry = new THREE.CircleGeometry(0.05, 16);
      const buttonMaterial = new THREE.MeshPhongMaterial({ 
        color: i % 3 === 0 ? 0xff0000 : i % 3 === 1 ? 0x00ff00 : 0x0000ff 
      });
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.copy(pos);
      group.add(button);
    });
    
    // Light source and detector
    const lightSourceGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16);
    const lightSourceMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5
    });
    const lightSource = new THREE.Mesh(lightSourceGeometry, lightSourceMaterial);
    lightSource.position.set(-0.2, 0.4, 0);
    lightSource.rotation.z = Math.PI / 2;
    group.add(lightSource);
    
    const detectorGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16);
    const detectorMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const detector = new THREE.Mesh(detectorGeometry, detectorMaterial);
    detector.position.set(0.2, 0.4, 0);
    detector.rotation.z = Math.PI / 2;
    group.add(detector);
    
    // Sample cuvette (transparent)
    const cuvetteGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
    const cuvetteMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.5
    });
    const cuvette = new THREE.Mesh(cuvetteGeometry, cuvetteMaterial);
    cuvette.position.set(0, 0.4, 0);
    group.add(cuvette);
    
    // Colored liquid in cuvette
    const liquidGeometry = new THREE.BoxGeometry(0.08, 0.15, 0.08);
    const liquidMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x88aaff,
      transparent: true,
      opacity: 0.8
    });
    const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquid.position.set(0, 0.375, 0);
    group.add(liquid);
  };

  const createPipetteModel = (group: THREE.Group) => {
    // Pipette body
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x2266aa });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    body.castShadow = true;
    group.add(body);
    
    // Plunger
    const plungerGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16);
    const plungerMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    const plunger = new THREE.Mesh(plungerGeometry, plungerMaterial);
    plunger.position.y = 0.9;
    plunger.castShadow = true;
    group.add(plunger);
    
    // Plunger button
    const buttonGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16);
    const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.y = 1.07;
    button.castShadow = true;
    group.add(button);
    
    // Volume adjustment dial
    const dialGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16);
    const dialMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const dial = new THREE.Mesh(dialGeometry, dialMaterial);
    dial.position.set(0, 0.6, 0.15);
    dial.rotation.x = Math.PI / 2;
    dial.castShadow = true;
    group.add(dial);
    
    // Volume display
    const displayGeometry = new THREE.PlaneGeometry(0.3, 0.1);
    const displayMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.2
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 0.4, 0.16);
    group.add(display);
    
    // Pipette tip
    const tipGeometry = new THREE.CylinderGeometry(0.08, 0.01, 0.5, 16);
    const tipMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.y = -1;
    tip.castShadow = true;
    group.add(tip);
    
    // Ejector button
    const ejectorGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.15);
    const ejectorMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const ejector = new THREE.Mesh(ejectorGeometry, ejectorMaterial);
    ejector.position.set(0, 0.2, 0.15);
    ejector.castShadow = true;
    group.add(ejector);
    
    // Liquid in tip (optional)
    const liquidGeometry = new THREE.CylinderGeometry(0.07, 0.005, 0.1, 16);
    const liquidMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x88aaff,
      transparent: true,
      opacity: 0.8
    });
    const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquid.position.y = -1.2;
    group.add(liquid);
    
    // Rotate for better view
    group.rotation.x = Math.PI / 6;
  };

  const createIncubatorModel = (group: THREE.Group) => {
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(2, 2, 1.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xeeeeee });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Door frame
    const doorFrameGeometry = new THREE.BoxGeometry(1.6, 1.6, 0.05);
    const doorFrameMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.z = 0.75;
    doorFrame.castShadow = true;
    group.add(doorFrame);
    
    // Door glass
    const doorGlassGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.02);
    const doorGlassMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xaaccff,
      transparent: true,
      opacity: 0.5
    });
    const doorGlass = new THREE.Mesh(doorGlassGeometry, doorGlassMaterial);
    doorGlass.position.z = 0.76;
    doorGlass.castShadow = true;
    group.add(doorGlass);
    
    // Door handle
    const handleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 16);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0.6, 0, 0.8);
    handle.rotation.x = Math.PI / 2;
    handle.castShadow = true;
    group.add(handle);
    
    // Control panel
    const panelGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.05);
    const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(0, 0.8, 0.78);
    panel.castShadow = true;
    group.add(panel);
    
    // Display
    const displayGeometry = new THREE.PlaneGeometry(0.4, 0.15);
    const displayMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    });
    const display = new THREE.Mesh(displayGeometry, displayMaterial);
    display.position.set(0, 0.85, 0.81);
    group.add(display);
    
    // Control buttons
    const buttonPositions = [
      new THREE.Vector3(-0.15, 0.7, 0.81),
      new THREE.Vector3(0, 0.7, 0.81),
      new THREE.Vector3(0.15, 0.7, 0.81)
    ];
    
    buttonPositions.forEach((pos, i) => {
      const buttonGeometry = new THREE.CircleGeometry(0.03, 16);
      const buttonMaterial = new THREE.MeshPhongMaterial({ 
        color: i === 0 ? 0xff0000 : i === 1 ? 0x00ff00 : 0x0000ff 
      });
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.copy(pos);
      group.add(button);
    });
    
    // Shelves inside (visible through door)
    const shelfPositions = [-0.4, 0, 0.4];
    
    shelfPositions.forEach(y => {
      const shelfGeometry = new THREE.BoxGeometry(1.4, 0.05, 1);
      const shelfMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
      shelf.position.set(0, y, 0.2);
      shelf.castShadow = true;
      shelf.receiveShadow = true;
      group.add(shelf);
      
      // Add some petri dishes or samples on shelves
      for (let i = -1; i <= 1; i++) {
        if (Math.random() > 0.3) {  // Randomly place items
          const itemGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
          const itemMaterial = new THREE.MeshPhongMaterial({ 
            color: Math.random() > 0.5 ? 0xffffcc : 0xffccff 
          });
          const item = new THREE.Mesh(itemGeometry, itemMaterial);
          item.position.set(i * 0.4, y + 0.05, 0.2);
          item.castShadow = true;
          group.add(item);
        }
      }
    });
    
    // Vents on sides
    const ventGeometry = new THREE.PlaneGeometry(1, 0.4);
    const ventMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const leftVent = new THREE.Mesh(ventGeometry, ventMaterial);
    leftVent.position.set(-1.01, -0.5, 0);
    leftVent.rotation.y = Math.PI / 2;
    group.add(leftVent);
    
    const rightVent = new THREE.Mesh(ventGeometry, ventMaterial);
    rightVent.position.set(1.01, -0.5, 0);
    rightVent.rotation.y = -Math.PI / 2;
    group.add(rightVent);
  };

  return (
    <div 
      ref={containerRef} 
      className="rounded-md overflow-hidden shadow-md"
      style={{ width, height }}
    />
  );
}