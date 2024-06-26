import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { gsap } from "gsap";
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { React, useEffect, useState } from "react";
import { Select, FormControl, InputLabel, MenuItem } from "@mui/material/";
import {
    LoaderUtils,
    LoadingManager,
} from 'three';

const MANAGER = new LoadingManager();

export default function Model() {

    const [animationList, setAnimationList] = useState([]);
    const [actionList, setActionList] = useState([]);
    const [currentAnimation, setCurrentAnimation] = useState(-1);
    const [model, setModel] = useState(null);
    const [selectedSize, setSelectedSize] = useState(1);
    const [isHolding, setIsHolding] = useState(false);
    const [moustPosition, setMoustPosition] = useState({ x: 0, y: 0 });
    const [lastRotation, setLastRotation] = useState(null);

    const handleChange = (e) => {
        console.log(e.target.value)
        setCurrentAnimation(e.target.value);
    }

    const handleSliderChange = (e) => {
        setSelectedSize(e.target.value);
    }
    useEffect(() => {
        setModel(new Experience());
    }, []);

    useEffect(() => {
        if (model) {
            if (currentAnimation != -1) {
                model.activeAction = actionList[currentAnimation]
                model.currentAnimation = currentAnimation;

            }
            else {
                model.currentAnimation = -1;
            }
            model.modelSize = selectedSize;
            model.loadModel()
            console.log(model.activeAction)

        }
    }, [currentAnimation, selectedSize]);

    useEffect(() => {
        if (model) {
            model.isHolding = isHolding;
            model.mouse = moustPosition;
            if (lastRotation !== null) {
                model.lastRotation = lastRotation;
            }

        }
    }, [isHolding]);



    class Experience {
        isHovering = false;
        scrollPos = 0;

        constructor() {
            this.windowResize = this.windowResize.bind(this);
            this.windowScroll = this.windowScroll.bind(this);
            this.mouseMove = this.mouseMove.bind(this);
            this.animate = this.animate.bind(this);
            this.currentAnimation = -1;
            this.modelSize = selectedSize;
            this.isHolding = false;
            this.mouse = { x: 0, y: 0 };
            this.lastRotation = { x: 0, y: 0 };
            this.textureArray = [];


            this.setScene();
            this.setCanvas();
            this.setInput();
            this.setCameras();
            this.setRenderer();
            this.createBox();
            this.loadModel();
            this.addLights();
            this.setEvents();

            this.clock = new THREE.Clock();

            this.animate();
        }

        setScene() {
            this.scene = new THREE.Scene();
        }

        setCanvas() {
            const newCanvas = document.createElement("canvas");
            newCanvas.id = "webgl";
            document.body.appendChild(newCanvas);
            this.canvas = newCanvas;
        }
        setInput() {
            const newInput = document.createElement("div");
            newInput.id = "myinput";
            //newInput.type = "file";
            newInput.multiple = true;
            newInput.style.border = "2px dashed #ccc";
            newInput.style.padding = "20px";
            newInput.style.margin = "20px auto";
            newInput.style.width = "100%";
            newInput.style.height = "200px";
            newInput.style.textAlign = "center";
            newInput.style.lineHeight = "200px";
            newInput.style.fontWeight = "bold";
            newInput.style.fontSize = "25px";
            newInput.innerHTML = "Drop Model and Textures";
            

            document.body.appendChild(newInput);

            this.input = newInput;


            this.texture = null
            this.URL = "https://webflow-and-code.s3.amazonaws.com/glTF/Fox.gltf"
        }

        setCameras() {
            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.z = 5;
            this.scrollPos = this.camera.position.y;
            this.scene.add(this.camera);
        }

        setRenderer() {

            const rendererPercentage = 0.8;

            const width = window.innerWidth * rendererPercentage;
            const height = window.innerHeight * 0.6;

            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
            this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
            this.renderer.setSize(width, height);

        }

        addLights() {
            const ambientLight = new THREE.AmbientLight();
            this.scene.add(ambientLight);
        }

        createBox() {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            this.box = new THREE.Mesh(geometry, material);

            this.group = new THREE.Group();

            this.group.position.y = -2.5;

            this.group.add(this.box);
            this.scene.add(this.group);
        }

        windowResize(e) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        windowScroll(e) {
            this.scrollPos =
                (window.pageYOffset || document.scrollTop) -
                (document.clientTop || 0) || 0;
        }

        mouseMove(e) {
            if (this.isHolding) {
                this.mouse.x = e.clientX / window.innerWidth - 0.5;
                this.mouse.y = e.clientY / window.innerHeight - 0.5;
                setMoustPosition(this.mouse)
            }
        }

        mouseUp(e) {
            setIsHolding(false);
            if (moustPosition) {
                this.lastRotation = moustPosition;
                setLastRotation(moustPosition);
            }

        }

        mouseDown(e) {
            setIsHolding(true);
        }

        mouseLeave(e) {
            setIsHolding(false);
        }

        setEvents() {
            this.canvas.addEventListener("resize", this.windowResize);
            this.canvas.addEventListener("scroll", this.windowScroll);
            this.canvas.addEventListener('mousemove', this.mouseMove);
            this.canvas.addEventListener('mouseup', this.mouseUp);
            this.canvas.addEventListener("mousedown", this.mouseDown);
            this.canvas.addEventListener("mouseleave", this.mouseLeave);
            this.input.addEventListener("change", (e) => {
                const fileList = e.target.files;

                const gltfGlbFile = Array.from(fileList).find(file => {
                    const lowerCaseName = file.name.toLowerCase();

                    return lowerCaseName.endsWith('.gltf') || lowerCaseName.endsWith('.glb');
                });

                const pngJpgFiles = Array.from(fileList).filter(file => {
                    const lowerCaseName = file.name.toLowerCase();
                    return lowerCaseName.endsWith('.png') || lowerCaseName.endsWith('.jpg');
                });

                this.textureArray = pngJpgFiles;
                const url = URL.createObjectURL(gltfGlbFile);
                this.URL = url;

                this.loadModel();
            })

            // Add event listeners for drag and drop functionality
            this.input.addEventListener("dragover", (e) =>  {
                e.preventDefault();
            });

            this.input.addEventListener("drop", (e) =>  {
                e.preventDefault();
                const files = e.dataTransfer.files;

                const fileList = files;

                const gltfGlbFile = Array.from(fileList).find(file => {
                    const lowerCaseName = file.name.toLowerCase();

                    return lowerCaseName.endsWith('.gltf') || lowerCaseName.endsWith('.glb');
                });

                const pngJpgFiles = Array.from(fileList).filter(file => {
                    const lowerCaseName = file.name.toLowerCase();
                    return lowerCaseName.endsWith('.png') || lowerCaseName.endsWith('.jpg');
                });

                this.textureArray = pngJpgFiles;
                const url = URL.createObjectURL(gltfGlbFile);
                this.URL = url;

                this.loadModel();
            });


        }
        loadModel() {
            MANAGER.setURLModifier((url, path) => {
                const baseURL = LoaderUtils.extractUrlBase(url);
                const normalizedURL =
                    decodeURI(url)
                        .replace(baseURL, '')
                        .replace(/^(\.?\/)/, '');
                if (this.textureArray.some(file => file.name === normalizedURL)) {
                    const blob = this.textureArray.find(file => file.name === normalizedURL);
                    const blobURL = URL.createObjectURL(blob);
                    return blobURL;

                }
                return (path || '') + url;
            });
            const gltfLoader = new GLTFLoader(MANAGER);
            gltfLoader.load(
                this.URL,
                (gltf) => {
                    gltf.scene.scale.set(0.03 * Number(this.modelSize), 0.03 * Number(this.modelSize), 0.03 * Number(this.modelSize));
                    gltf.scene.position.y = 0.5;
                    this.group.add(gltf.scene);

                    const grourLength = this.group.children.length
                    if (grourLength > 2) {
                        this.group.children.splice(grourLength - 2, 1);
                    }


                    this.mixer = new THREE.AnimationMixer(gltf.scene);

                    if (animationList !== gltf.animations) {
                        setAnimationList(gltf.animations);
                    }

                    if (this.currentAnimation != -1) {
                        this.action1 = this.mixer.clipAction(gltf.animations[this.currentAnimation]);
                        this.activeAction = this.action1;
                        this.activeAction
                            .reset()
                            .setEffectiveTimeScale(1)
                            .setEffectiveWeight(1)
                            .play()
                    }
                    else {
                        try {
                            this.activeAction.stop();
                        }
                        catch {
                            //pass
                        }
                    }
                }
            );

        }


        fadeToAction(newAction, duration = 0.2) {
            const previousAction = this.activeAction;
            this.activeAction = newAction;

            if (previousAction !== this.activeAction) {
                previousAction.fadeOut(duration);
            }

            this.activeAction
                .reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(duration)
                .play();
        }


        animate() {
            this.camera.position.y = -this.scrollPos * 0.005;

            gsap.to(this.group.rotation, {
                x: this.lastRotation.y + this.mouse.y * 10,
                y: this.lastRotation.x + this.mouse.x * 10
            });

            if (this.mixer) {
                this.mixer.update(this.clock.getDelta());
            }

            this.box.material.color = this.isHovering
                ? new THREE.Color(0.0, 1.0, 0.0)
                : new THREE.Color(1.0, 0.0, 0.0);

            this.renderer.render(this.scene, this.camera);

            window.requestAnimationFrame(this.animate);
        }
    }



    return (
        <div id="ModelDiv">
            <Box sx={{ width: 300 }}>
                <Slider defaultValue={1} step={0.01} aria-label="Default" min={1} max={10} onChange={handleSliderChange} valueLabelDisplay="auto" id="sizeSlider" />
            </Box>
            <FormControl>
                <InputLabel id="select-label">Choose an option</InputLabel>
                <Select
                    labelId="select-label"
                    id="select"
                    label="Choose an option"
                    value={currentAnimation}
                    onChange={handleChange}
                >
                    <MenuItem value={-1}>No Animation</MenuItem>
                    {animationList.map((element, index) => (
                        <MenuItem value={index}>{element.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    )
}



