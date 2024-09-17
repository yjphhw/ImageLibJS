# ImageLibJS
The ImageLibJS is an image processing library implemented in raw JavaScript. The ImageLibJS conforms to the ES6 standard and can be easily integrated into web browsers and other JavaScript environments.

The aim of the ImageLibJS is to provide a simple and easy-to-use image read, write and processing library under web environment, which can be used in pre-processing or post-processing in image processing pipeline, especially for onnxruntime.js and other machine learning libraries doing image processing,  not like OpenCV for complete image processing.

In ImageLibJS, there are two main classes: **ImgArray** and **Img**.


## Installation

The ImageLibJS is a one file library, so it can be easily integrated into your project.

Clone this repository or download the ImageLibJS.js file directly, then  include  ImageLibJS.js in your html file:

```html
    <script src="./ImageLibJS.js"></script>
    <script>
        //create a array representing a 256*256 image, filled with 255 in channel 0
        let imgarr=new ImgArray({height:256,width:256});
        imgarr.fill(255,0);
        //show array as a red image in browser
        imgarr.show();
    </script>
```


## ImgArray class

The ImgArray class is the core class of ImageLibJS and implements a 3D array in pure JavaScript. The dimensions of the array are referred to as height, width, and channel, representing the image's height, width, and channels, respectively. In images, the channels are typically 1, 3, and 4, but in ImgArray, the channels can be any number, such as 1, 2, 3, 4, and so on. The operations of ImgArray are similar to Numpy, making it easy to use. The data of an ImgArray object is stored in TypedArray in JavaScript.

example: generate a 3D array which represents an image, filled the red channel with 255, then show it in the browser.

```js
//generate a 3D array with height 256, width 512, 3 channels, default value is 0.
//生成一个高256，宽512，3通道的数组，默认值是0 
let imgarr=new ImgArray({height:256,width:512}); 
//fill the first channel with 255, which means red
//将数组的第0个通道填充255，即红色
imgarr.fill(255,0); 
//show the array as red image in browser
//显示数组为一幅红色图像
imgarr.show(); 
```

## Img class

The Img class is extended from ImgArray and can perform the same operations on arrays. However, it is not recommended to use the ImgArray methods directly on an Img object without checking the result or the source code.

The Img class is primarily designed for image reading and writing, rather than for image processing, although it does offer some image processing methods which are impelmented by Canvas API not array operation,such as resize and rotate.

example: read an image from camera, draw text on it, then show it in the browser.

```js
let img=await Img.fromcamera()
img.drawtext()
img.show()
```

## Demos

Since ImageLibJS is a JavaScript library, GitHub Pages is used to host demos.

Click the link below to see demos:

[ImageLibJS Demos](https://yjphhw.github.io/ImageLibJS/demo.html)

Thanks to GitHub Pages to host demos. You can use broswer development tools to debug demos and learn the details of demos. It's a good start to learn the ImageLibJS by demos. 

Also you can download the repo and run demos locally.
All demos are in the examples folder. The demo.html file in this directory is the entrance of all demos. It is recommended to server the demo.html file in a native web server, such as LiveServer in VS Code, or Python's built-in server to get all the demos run properly.

For example, to run the demo, you can use Python's built-in server:
1. Open a terminal in the directory where the demo.html file is located, and run the following command:
   
```bash
python -m http.server
```

2. Open the URL displayed in the terminal (like: http://localhost:8000/) in the browser, and you will see the demo.html file.


## Plans

Due to personal time constraints, the ImageLibJS will follow a tick-tock update pattern, with one month designated as "tick" and the following month as "tock". 

During the odd months (tick months), the focus will primarily be on addressing two to three small bugs, revising code, creating demos, updating documentation, and planning new features.

During the even months (tock months), the main focus will be on implementing one to three new features, addressing one critical bug, and making API changes.


## License

The ImageLibJS is licensed under the MIT License. Individual can be freely used in any project with no warranty. However, if company wants to use the ImageLibJS in their product, they need to pay a license fee, 100 USD per year or equivalent. 

Donations to support this project are welcome.


## History
* tick: 2024-9-20 add skin detection demo; add comments on some ImgArray methods; make decision to implement fliplr() , flipud() , rolllr(), rollud() methods in next month.
* tock: 2024-8-20 deploy all repo on github pages; a major change for Img class, add a canvas to Img, Img.resize() and Img.rotate() methods are rewrited, now they are synchronys; ImgArray and Img classes are supported chainner methods, sunch as ImgArray.random().mean(true).show() ; fix bugs in some demos.
* tick: 2024-7-20 revise README.md, add and fix several demos, fix bugs in vstack(), optimise fromcanvs() method.
* tock: 2024-6-20 update README.md, add hstack() and vstack() methods to ImageArray class, and provide hstack.html and vstack.html in examples. ImageLibJS version is 1.2
* 2024-6-11: The project is created and open-sourced in GitHub.
* 2023-12: The project is started in a Talent Student Training Program. The student Jing Li(李静) and Wei Hou(me) write the first version of ImageLibJS in local computers.
