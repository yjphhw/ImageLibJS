# ImageLibJS
 The ImageLibJS is an image processing library which is implemented by raw JavaScript. The ImageLibJS confirms with ES6 standard, and can be easily integrated into web browser and other JavaScript environment.

The aim of the ImageLibJS is to provide a simple and easy-to-use image read, write and processing library under web environment, not like OpenCV, which can be used in pre-processing or post-processing in image processing pipeline, especially for onnxruntime.js and other machine learning libraries doing image processing.

In ImageLibJS, there are two main classes: **ImgArray** and **Img**.


## Installation

The ImageLibJS is a one file library, so it can be easily integrated into your project.

Clone this repository or download the ImageLibJS.js file directly, then  include  ImageLibJS.js in your html file:

```html
    <script src="./ImageLibJS.js"></script>
    <script>
        let imgarr=new ImgArray({height:256,width:256});
        imgarr.fill(255,0);
        imgarr.show();
    </script>
```


## ImgArray class

The ImgArray class is the core class of the ImageLibJS, and implements and 3D array in pure JavaScript. The dimension of the array is called height, width, channel which represents image height, width and channel respectively. In image the channel is 1, 3,and 4, but in the ImgArray, the channel can be any number, like 1,2,3,4,.....  The ImgArray operations are similar to Numpy, so it is easy to use.

example: generate a 3D array which represents an image, filled the red channel with 255, then show it in the browser.

```js
//generate a 3D array with height 256, width 512, 3 channels, default value is 0.
//生成一个高256，宽512，3通道的数组，默认值是0 
let imgarr=new ImgArray({height:256,width:512}); 
//fill the first channel with 255, which means red
//将数组的第0个通道填充255，即红色
imgarr.fill(255,0); 
//show the array as red image in browser\
//显示数组为图像
imgarr.show();      
```

## Img class

The Img class is extended from ImgArray, it can do exactly the same operation on array, but it is not to courage to use the ImgArray methods, unless you check the result or source code.

The Img class is mainly for image read and write, not for image processing, althourgh it provides some image processing methods, like resize, rotate, etc.

example: read an image from camera, draw text on it, then show it in the browser.

```js
let img=await Img.fromcamera()
img.drawtext()
img.show()
```

## Demo

Open the demo.html or html files in examples directory with a web browser.


## Plans

Due to personal time constraints, the ImageLibJS will take tick-tock behavior for update, one month for tick, one month for tock. The odd month is tick month, the even month is tock month.

In tick month(odd month), mainly focus on two or three small bug fixing, code revise, making demons, documentation and planing new features.

In tock month(even month), mainly focus on implementing  one to three new features, one serious bug fixing, and API changes.


## Contributors

The student Jing Li(李静) and Wei Hou(me) write the first version of ImageLibJS.

Currently, the project is maintained by me. 



## License

The ImageLibJS is licensed under the MIT License. Individual can be freely used in any project with no warranty. However, if company wants to use the ImageLibJS in their product, they need to pay a license fee, 100 USD per year or equivalent. 

Donations to support this project are welcome.




## History
* 2024-6-11 the project is created.
* tock: 2024-6-20 update README.md, add hstack() and vstack() methods to ImageArray class, and provide hstack.html and vstack.html in examples. ImageLibJS version is 1.2
