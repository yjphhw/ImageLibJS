//ImageLibJS是一个基于ES6面向WEB的以图像处理为核心的数组运算库。
//文档生成命令：npx jsdoc ./Imagelib.js -d docs

/**
 * @class ImgArray更重要的是数组，提供数组的计算，但是数组的运算支持上偏向于图像处理,
 * 后期可以仿照Numpy转为强大的数组计算库,支持常见的多种元素数据类型初始化，但是仅对
 * float32类型进行了广泛地验证和测试，其他类型未验证，使用时需要注意自行检查。
 */
class ImgArray {
    /**
     * dtypes 是一个静态对象，对于存储数组数据的类型与JS TypedArray的映射关系。
     * @type {Object}
     * @example 
     *   //dtypes的值如下：
     *   dtypes = {
     *   float32: Float32Array,
     *   uint8: Uint8Array,
     *   uint16: Uint16Array,
     *   int32: Int32Array,
     *   uint32: Uint32Array,
     *   cuint8: Uint8ClampedArray,
     *   int16: Int16Array,
     *   int8: Int8Array,
     *   float64: Float64Array,
     *   };  
    */
    static dtypes = {
        float32: Float32Array,
        uint8: Uint8Array,
        uint16: Uint16Array,
        int32: Int32Array,
        uint32: Uint32Array,
        cuint8: Uint8ClampedArray,
        int16: Int16Array,
        int8: Int8Array,
        float64: Float64Array,
    };

    /**
     * dtypenames 获取{@link ImgArray#dtypes}对象中所有数据类型的名称。返回一个包含所有数据类型名称的数组,数组中包含{@link ImgArray#dtypes}对象的所有键。
     * @static
     * @type {string[]}
     */
    static get dtypenames() {
        return Object.keys(this.dtypes);
    }

    /**
     * constructor，数组初始化函数，采用对象的方式进行初始化，提供了默认参数。
     * 只实现了三维数组，各维度类比于图像的高，宽和通道，即height，width，channel。
     * @constructor
     * @param {Object} options - 配置对象，用于初始化图像数据。
     * @param {number} [options.height=256] - 表示数组（图像）的高度，默认值是256
     * @param {number} [options.width=256] - 表示数组（图像）的宽度，默认值是256
     * @param {number} [options.channel=3] - 表示数组（图像）的通道数，默认值是3
     * @param {boolean} [options.lazy=false] - 默认值为false，表示进行数组元素的初始化，否则不进行元素的数组元素的初始化
     * @param {string} [options.dtype='float32'] - 默认为'float32'，可选的值为dtypes中的值  
     */
    constructor({ height = 256, width = 256, channel = 3, lazy = false, dtype = 'float32' } = {}) {
        this.height = height;
        this.width = width;
        this.channel = channel;
        this.numel = height * width * channel;  //元素数量
        this.dtype = dtype
        this.data = null;
        if (lazy == false) {
            this.initarray()
        }
    }

    /**
     * initarray() 根据数组的基本信息，为数组分配存储空间。
     * 当数组初始化时lazy=false时调用，分配空间，分配后数组元素的值为0。
     *  @returns {ImgArray} 返回当前实例，以支持链式调用。
     */
    initarray() {
        if (this.data == null) {
            this.data = new ImgArray.dtypes[this.dtype](this.numel);
        }
        this.lazy = false;
        return this;
    }


    /**
     * 表示数组形状
     * @typedef {Object} Shape 
     * @property {number} height - 数组的高度
     * @property {number} width  - 数组的宽度
     * @property {number} channel -数组的通道数
     */

    /** 
     * 返回图像的形状对象。用属性的方式获取数组的形状，包括高，宽，通道。
     * @type {Shape}
     */
    get shape() {
        return { height: this.height, width: this.width, channel: this.channel };
    }

    /**
     * size，获取数组元素的个数。
     * @type {number}
     */
    get size() {
        return this.numel;
    }

    /**
     * elbytes，数组中一个元素占用的字节数。
     * @type {number} 
     */
    get elbytes() {
        return ImgArray.dtypes[this.dtype].BYTES_PER_ELEMENT;
    }

    /**
     * bytesize，用属性的方式获取数组占用的总字节数。
     * @type {number} 
     */
    get bytesize() {
        return this.numel * this.elbytes;
    }

    /**
     * elidxtoidx，将元素的索引转为数组的三个索引值[h,w,c]
     * 该函数是一个内部函数，一般由其他方法调用，不对外使用
     * @param {number} [elidx=0] - 线性索引，默认值为0，表示获取第一个元素，即[0,0,0]
     * @returns {number[]|undefined} 返回一个包含三维索引的数组，或者如果 `elidx` 超出范围，返回 `undefined`。
     *  - hidx: 高度索引，表示数组的第0维索引。
     *  - widx: 宽度索引，表示数组的第1维索引。
     *  - cidx: 通道索引，表示数组的第2维索引。
     */
    elidxtoidx(elidx = 0) {
        if (elidx < 0 || elidx > this.numel - 1) return;
        let hwidth = this.width * this.channel;
        let hidx = parseInt(elidx / hwidth);
        elidx = elidx % hwidth;
        let widx = parseInt(elidx / this.channel);
        let cidx = elidx % this.channel;
        return [hidx, widx, cidx];
    }

    /**
     * idxtoelidx，将数组的三个索引值[h,w,c]，转为元素索引elidx
     * 该函数是一个内部函数，一般由其他方法调用，不对外使用
     * @param {number} hidx - 数组元素的高索引，也就是第0维度的索引
     * @param {number} widx - 数组元素的宽索引，也就是第1维度的索引
     * @param {number} cidx - 数组元素的通道索引，也就是第2维度的索引
     * @return {number} - 元素在数组内的真实索引值
     */
    idxtoelidx(hidx, widx, cidx) {
        return (hidx * this.width + widx) * this.channel + cidx;
    }

    /**
     * checkisvalid，检查索引值是否合法，即是否在数组范围内
     * 目前只支持正索引
     * @param {number} hidx - 数组元素的高索引，也就是第0维度的索引
     * @param {number} widx - 数组元素的宽索引，也就是第1维度的索引
     * @param {number} cidx - 数组元素的通道索引，也就是第2维度的索引
     * @return {boolean} - true表示索引合法，false表示索引不合法
     */
    checkisvalid(hidx, widx, cidx) {
        if (hidx + 1 > this.height || hidx < 0) return false;
        if (widx + 1 > this.width || widx < 0) return false;
        if (cidx + 1 > this.channel || cidx < 0) return false;
        return true;
    }

    /**
     * getel，根据数组索引获取元素值
     * @param {number} hidx - 数组元素的高索引，也就是第0维度的索引 
     * @param {number} widx - 数组元素的宽索引，也就是第1维度的索引
     * @param {number} cidx - 数组元素的通道索引，也就是第2维度的索引
     * @returns {number|null} 元素值，若数组元素索引越界，则返回null
     */
    getel(hidx, widx, cidx) {
        //由数组索引获取元素值
        // TODO: 当数组为
        if (this.data === null) {
            console.error('数组没有初始化');
            return null;
        }
        if (this.checkisvalid(hidx, widx, cidx)) {
            return this.data.at(this.idxtoelidx(hidx, widx, cidx));
        }
        console.error('数组元素索引越界');
        return null;
    }

    /**
     * setel，根据索引设置指定元素的值
     * @param {number} hidx - 数组元素的高索引，也就是第0维度的索引 
     * @param {number} widx - 数组元素的宽索引，也就是第1维度的索引
     * @param {number} cidx - 数组元素的通道索引，也就是第2维度的索引
     * @param {number} value - 要设置的元素值
     * @returns {ImgArray|null} 该数组对象本身，若数组元素索引越界，则返回null
     */
    setel(hidx, widx, cidx, value) {
        this.initarray();
        if (this.checkisvalid(hidx, widx, cidx)) {
            this.data[this.idxtoelidx(hidx, widx, cidx)] = value;
            return this;  //以供链式调用
        }
        console.error('数组元素索引越界')
        return null;
    }

    /**
     * fill，向数组填充常数数值。
     * @param {number|number[]} [value=3] - 要填充的值，可以是一个数值，也可以是一个数组，数组长度与通道数相同，表示对每个通道进行填充
     * @param {number|number[]} [cidx=null] - 要填充的通道索引，可以是一个数值，也可以是一个数组，表示对多个通道进行填充
     * @returns {ImgArray} 该数组对象本身
     * @example 
     *      new ImgArray().fill(255);        //填充所有元素值为255；
     * @example
     *      new ImgArray().fill(255,1);     //只对1通道填充为255；
     * @example
     *      new ImgArray().fill(255,[0,1]); //对0，1通道填充均填充为255
     * @example
     *      new ImgArray().fill([255,120],[0,2]);    //对0通道填充255，对2道填充120
     */
    fill(value = 3, cidx = null) {
        this.initarray();
        if (cidx == null) {
            this.data.fill(value);
            return this;
        }
        if (cidx instanceof Array) {
            if (value instanceof Array) {
                if (value.length == cidx.length) {
                    let map = {};
                    cidx.forEach((x, idx) => { map[x] = value[idx]; });
                    this.data.forEach((x, idx, arr) => {
                        let ci = idx % this.channel;
                        if (map[ci]) arr[idx] = map[ci];
                    }, this);
                }
                else {
                    console.error("value数组长度与cidx数组长度不一致");
                }
            }
            else {
                this.data.forEach((x, idx, arr) => { if (cidx.includes(idx % this.channel)) arr[idx] = value; }, this);
            }
        }
        else {
            this.data.forEach((x, idx, arr) => { if (idx % this.channel == cidx) arr[idx] = value; }, this);
        }
        return this;
    }

    /**
     * issameshape，两数组形状是否相同
     * @param {ImgArray} bimgarr - 另一个数组
     * @returns {Boolean} 两数组形状是否相同
     */
    issameshape(bimgarr) {
        //判断两数组形状是否相同
        return this.height === bimgarr.height &&
            this.width === bimgarr.width &&
            this.channel === bimgarr.channel;
    }

    /**
     * issamehw，两数组宽高是否相同
     * @param {ImgArray} bimgarr - 另一个数组
     * @returns {Boolean} 两数组宽高是否相同
     */
    issamehw(bimgarr) {
        return this.height === bimgarr.height && this.width === bimgarr.width;
    }

    /**
     * issamech，判断两数组的通道是否相同
     * @param {ImgArray} bimgarr - 另一个数组
     * @returns {Boolean} 两数组的通道是否相同
     */
    issamech(bimgarr) {
        return this.channel === bimgarr.channel
    }

    /**
     * dstack，将多个数组沿通道堆叠，数组的宽高必须要相同
     * @param {ImgArray|...ImgArray} - 一个或多个数组 
     * @returns {ImgArray|undefined} 堆叠形成的新数组，若堆叠数组的宽高尺寸不一致,返回undefined
     */
    dstack(...imgars) {
        //imgars里为ImgArray实例，应当要具备相同的尺寸
        //将该数组与另外多个高宽一致的数组堆叠为一个新数组
        let tmpimgarrs = [this, ...imgars];
        let channelnum = 0;
        let channelmapping = [];
        for (let imgidx = 0; imgidx < tmpimgarrs.length; imgidx++) {
            if (!this.issamehw(tmpimgarrs[imgidx])) {
                console.error(`错误：第${imgidx}个堆叠数组的宽高尺寸不一致`);
                return;
            }
            let tmpchannel = tmpimgarrs[imgidx].channel;
            channelnum += tmpchannel;
            for (let cidx = 0; cidx < tmpchannel; cidx++) {
                channelmapping.push([imgidx, cidx]);
            }
        }
        let newimgarr = new ImgArray({ height: this.height, width: this.width, channel: channelnum })

        for (let hidx = 0; hidx < newimgarr.height; hidx++) {
            for (let widx = 0; widx < newimgarr.width; widx++) {
                for (let cidx = 0; cidx < newimgarr.channel; cidx++) {
                    let [imgidx, ocidx] = channelmapping[cidx];
                    let tmpv = tmpimgarrs[imgidx].getel(hidx, widx, ocidx);
                    newimgarr.setel(hidx, widx, cidx, tmpv)
                }
            }
        }
        return newimgarr;
    }

    /**
     * dsplit，提取数组的某些通道
     * @param {...number} channels - 要提取的通道索引
     * @returns {ImgArray} 提取的数组
     */
    dsplit(...channels) {
        //将数组沿通道进行分割
        //可获取指定通道的数据
        //dsplit(0,2),获取第0和2通道，返回是一个ImgArray的数组
        let arr = [];
        if (channels.length == 0) channels = [...new Array(this.channel).keys()]
        for (let i of channels) {
            let tmp = new ImgArray({ height: this.height, width: this.width, channel: 1 });
            for (let hidx = 0; hidx < this.height; hidx++) {
                for (let widx = 0; widx < this.width; widx++) {
                    let value = this.getel(hidx, widx, i);
                    tmp.setel(hidx, widx, 0, value);
                }
            }
            arr.push(tmp);
        }
        return arr;
    }

    /**
     * hstack，水平堆叠数组,沿宽度方向叠加
     * @param {...ImgArray} imgars - 水平堆叠的数组
     * @returns {ImgArray} 水平堆叠后的结果
     */
    hstack(...imgars) {
        //需要数组的高和通道数一置，但是该函数不进行检测，由用户来保证
        let tmpimgarrs = [this, ...imgars];
        let newwidth = 0;
        let widths = [];
        for (let imgidx = 0; imgidx < tmpimgarrs.length; imgidx++) {
            let tmpwidth = tmpimgarrs[imgidx].width;
            newwidth += tmpwidth;
            widths.push(newwidth);
        }
        let newimgarr = new ImgArray({ height: this.height, width: newwidth, channel: this.channel })

        for (let hidx = 0; hidx < newimgarr.height; hidx++) {
            for (let widx = 0; widx < newimgarr.width; widx++) {
                let imgidx = widths.map(x => widx < x).indexOf(true);
                let owidx = imgidx > 0 ? widx - widths[imgidx - 1] : widx;
                for (let cidx = 0; cidx < newimgarr.channel; cidx++) {
                    newimgarr.setel(hidx, widx, cidx, tmpimgarrs[imgidx].getel(hidx, owidx, cidx));
                }
            }
        }
        return newimgarr;
    }

    /**
     * vstack，垂直堆叠数组,沿高度方向叠加
     * @param  {...ImgArray} imgarrs - 垂直堆叠的数组
     * @returns {ImgArray} 垂直堆叠后的结果
     */
    vstack(...imgarrs) {
        //需要数组的宽和通道数一置，但是该函数不进行检测，由用户来保证
        let tmpimgarrs = [this, ...imgarrs];
        let newheight = 0;
        for (let imgidx = 0; imgidx < tmpimgarrs.length; imgidx++) {
            newheight += tmpimgarrs[imgidx].height;
        }
        let newarray = new ImgArray({ height: newheight, width: this.width, channel: this.channel });
        let offsetidx = 0;
        for (let imgidx = 0; imgidx < tmpimgarrs.length; imgidx++) {
            newarray.data.set(tmpimgarrs[imgidx].data, offsetidx);
            offsetidx += tmpimgarrs[imgidx].numel;
        }
        return newarray;
    }

    /**
     * 最近邻放大
     * scale,数组，使用最近邻方法进行对数组在宽度和高度上进行整数倍的缩放。
     * @param {number} scale -尺寸
     */
    scale(k = 8) {
        let outarr = new ImgArray({ height: this.height * k, width: this.width * k, channel: this.channel, dtype: this.dtype })
        for (let hidx = 0; hidx < outarr.height; hidx++) {
            for (let widx = 0; widx < outarr.width; widx++) {
                for (let cidx = 0; cidx < outarr.channel; cidx++) {
                    let v = this.getel(parseInt(hidx / k), parseInt(widx / k), cidx);
                    outarr.setel(hidx, widx, cidx, v);
                }
            }
        }
        return outarr;
    }


    /**
     * grid，将多个尺寸相同的数组堆叠成网格
     * @param {number} row - 行数
     * @param {number} col - 列数
     * @param  {...ImgArray} imgarrs - 需要堆叠的数组
     * @returns {ImgArray|undefined} 网格堆叠后的结果，若尺寸不一致，返回undefined
     */
    grid(row, col, ...imgarrs) {
        //参数为ImgArray实例，且必须为相同尺寸
        let tmpimgarrs = [this, ...imgarrs];
        if (row * col < 2 && tmpimgarrs.length != row * col) {
            console.error(`错误：参数错误，row=${row},col=${col},imgarrs.length=${imgarrs.length}`);
            return;
        }
        let outarr = new ImgArray({ height: row * this.height, width: col * this.width, channel: this.channel });
        for (let hidx = 0; hidx < outarr.height; hidx++) {
            for (let widx = 0; widx < outarr.width; widx++) {
                for (let cidx = 0; cidx < this.channel; cidx++) {
                    const imghidx = Math.floor(hidx / this.height);
                    const imgwidx = Math.floor(widx / this.width);
                    const imgidx = imghidx * col + imgwidx;
                    let tmpv = tmpimgarrs[imgidx].getel(hidx % this.height, widx % this.width, cidx);
                    outarr.setel(hidx, widx, cidx, tmpv);
                }
            }
        }
        return outarr;
    }

    /** 
    * repeat，在水平和竖直方向重复数组
    * @param {number} row - 在高度方向上重复的次数，也就是在行方向上重复的次数
    * @param {number} col - 在宽度方向上重复的次数，也就是在列方向上重复的次数
    * @returns {ImgArray|undefined} 重复后的结果，若row * col < 2，则返回undefined
    */
    repeat(row, col) {
        if (row * col < 2) {
            console.error(`错误：repeat参数错误，row=${row},col=${col}`);
            return;
        }
        let outarr = new ImgArray({ height: row * this.height, width: col * this.width, channel: this.channel });
        for (let hidx = 0; hidx < outarr.height; hidx++) {
            for (let widx = 0; widx < outarr.width; widx++) {
                for (let cidx = 0; cidx < this.channel; cidx++) {
                    let tmpv = this.getel(hidx % this.height, widx % this.width, cidx);
                    outarr.setel(hidx, widx, cidx, tmpv);
                }
            }
        }
        return outarr;
    }

    /**
     * filiplr,在宽度轴上，进行左右翻转
     * @returns {ImgArray} 水平翻转后的结果
     */
    fliplr() {
        let outarr = this.empty(false);
        for (let hidx = 0; hidx < this.height; hidx++) {
            for (let widx = 0; widx < this.width; widx++) {
                for (let cidx = 0; cidx < this.channel; cidx++) {
                    let tmpv = this.getel(hidx, widx, cidx);
                    outarr.setel(hidx, this.width - widx - 1, cidx, tmpv);
                }
            }
        }
        return outarr
    }

    /**
     * flipud, 在高度轴上，进行上下翻转
     * @returns {ImgArray} 上下翻转后的结果
    */
    flipud() {
        let outarr = this.empty(false);
        for (let hidx = 0; hidx < this.height; hidx++) {
            for (let widx = 0; widx < this.width; widx++) {
                for (let cidx = 0; cidx < this.channel; cidx++) {
                    let tmpv = this.getel(hidx, widx, cidx);
                    outarr.setel(this.height - hidx - 1, widx, cidx, tmpv)
                }
            }
        }
        return outarr
    }

    /**
     * rollud，上下滚动
     * @param {number} [dy=100] - 滚动距离，默认为100
     * @returns {ImgArray} 滚动后的结果
     */
    rollud(dy = 100) {
        dy = -Math.sign(dy) * (Math.abs(dy) % this.height);
        let newarr = this.empty(false);
        for (let hidx = 0; hidx < this.height; hidx++) {
            for (let widx = 0; widx < this.width; widx++) {
                for (let cidx = 0; cidx < this.channel; cidx++) {
                    let tmpv = this.getel(hidx, widx, cidx);
                    newarr.setel((hidx + dy + this.height) % this.height, widx, cidx, tmpv)
                }
            }
        }
        return newarr;
    }

    /**
     * rolllr，左右滚动
     * @param {number} [dx=100] - 滚动距离，默认为100
     * @returns {ImgArray} 滚动后的结果
     */
    rolllr(dx = 100) {
        dx = Math.sign(dx) * (Math.abs(dx) % this.width);
        let newarr = this.empty(false);
        for (let hidx = 0; hidx < this.height; hidx++) {
            for (let widx = 0; widx < this.width; widx++) {
                for (let cidx = 0; cidx < this.channel; cidx++) {
                    let tmpv = this.getel(hidx, widx, cidx);
                    newarr.setel(hidx, (widx + dx + this.width) % this.width, cidx, tmpv)
                }
            }
        }
        return newarr;
    }

    /**
     * rotate，旋转
     * @param {number} [degree=90] - 旋转角度，默认为90
     * @returns {ImgArray} 旋转后的结果
     */
    rotate(degree = 90) {
        degree = degree % 360;
        let rad = degree * Math.PI / 180;
        let newarr = this.empty(false);
        let cx = (this.width - 1) / 2;
        let cy = (this.height - 1) / 2;
        let cos = Math.cos(rad);
        let sin = Math.sin(rad);
        let dx = cx - cx * cos + cy * sin;
        let dy = cy - cx * sin - cy * cos;
        for (let hidx = 0; hidx < this.height; hidx++) {
            for (let widx = 0; widx < this.width; widx++) {
                let oldwidx = cos * widx - sin * hidx + dx;
                let oldhidx = sin * widx + cos * hidx + dy;
                if (!this.checkisvalid(oldhidx, oldwidx, 0)) continue;
                for (let cidx = 0; cidx < this.channel; cidx++) {
                    let tmpv = this.getel(oldhidx, oldwidx, cidx);
                    newarr.setel(hidx, widx, cidx, tmpv);
                }
            }
        }
        return newarr
    }

    //数组点运算

    /**
     * vectorize，逐元素运算,function的形式参考array.map接受的回调函数的形式
     * @param {function} func - 函数，形式为(x)=>y
     * @returns {ImgArray} 运算结果
     */
    vectorize(func) {
        let newarr = this.empty(true);
        newarr.data = this.data.map(func);
        return newarr;
    }

    //数组间的运算

    /**
     * operateArrayOperation，数组间运算，运算方式由参数func决定
     * @param {ImgArray} otherArray - 与当前数组尺寸相同
     * @param {function} func - 是一个具有两个参数的函数，返回一个值
     * @returns {ImgArray|null} 运算结果，若两数组的尺寸不匹配或类型不匹配，则返回null
     */
    operateArrayOperation(otherArray, func) {
        if (this.issameshape(otherArray)) {
            let newarr = this.empty(true);
            newarr.data = this.data.map((val, idx) => func(val, otherArray.data[idx]));
            return newarr;
        } else {
            console.error('两数组的尺寸不匹配或类型不匹配。');
            return null;
        }
    }

    /**
     * add，数组加法，支持常数加法
     * @param {ImgArray|number} otherArrayOrValue - 与当前数组尺寸相同，或者为一个常数
     * @returns {ImgArray|null} 加法后的结果，若输入的是无效的操作数，则返回null
     */
    add(otherArrayOrValue) {
        const addFunc = (x, y) => x + y;
        if (typeof otherArrayOrValue === 'number') {
            return this.vectorize(x => addFunc(x, otherArrayOrValue));
        } else if (otherArrayOrValue instanceof ImgArray) {
            return this.operateArrayOperation(otherArrayOrValue, addFunc);
        } else {
            console.error('无效的操作数。');
            return null;
        }
    }

    /**
     * sub，数组减法，支持常数或数组
     * @param {ImgArray|number} otherArrayOrValue - 与当前数组尺寸相同，或者为一个常数
     * @returns {ImgArray|null} 减法后的结果，若输入的是无效的操作数，则返回null
     */
    sub(otherArrayOrValue) {
        const subFunc = (x, y) => x - y;
        if (typeof otherArrayOrValue === 'number') {
            return this.vectorize(x => subFunc(x, otherArrayOrValue));
        } else if (otherArrayOrValue instanceof ImgArray) {
            return this.operateArrayOperation(otherArrayOrValue, subFunc);
        } else {
            console.error('无效的操作数。');
            return null;
        }
    }

    /**
     * mul，数组乘法，支持常数或数组
     * @param {ImgArray|number} otherArrayOrValue - 与当前数组尺寸相同，或者为一个常数
     * @returns {ImgArray|null} 乘法后的结果，若输入的是无效的操作数，则返回null
     */
    mul(otherArrayOrValue) {
        const mulFunc = (x, y) => x * y;
        if (typeof otherArrayOrValue === 'number') {
            return this.vectorize(x => mulFunc(x, otherArrayOrValue));
        } else if (otherArrayOrValue instanceof ImgArray) {
            return this.operateArrayOperation(otherArrayOrValue, mulFunc);
        } else {
            console.error('无效的操作数。');
            return null;
        }
    }

    /**
     * div，数组除法，支持常数或数组
     * @param {ImgArray|number} otherArrayOrValue - 与当前数组尺寸相同，或者为一个常数
     * @returns {ImgArray|null} 除法后的结果，若输入的除数数组中包含0元素或除数不合法，则返回null
     */
    div(otherArrayOrValue) {
        const divFunc = (x, y) => x / y;
        if (typeof otherArrayOrValue === 'number' && otherArrayOrValue !== 0) {
            return this.vectorize(x => divFunc(x, otherArrayOrValue));
        } else if (otherArrayOrValue instanceof ImgArray) {
            if (otherArrayOrValue.data.some(value => value === 0)) {
                console.error('除数数组中包含0元素。');
                return null;
            }
            return this.operateArrayOperation(otherArrayOrValue, divFunc);
        } else {
            console.error('除数不合法。');
            return null;
        }
    }

    /**
     * clamp，截断，将小于vmin的元素变成vmin，大于vmax的元素变成vmax
     * @param {number} [vmin=0] - 最小值，默认为0
     * @param {number} [vmax=255] - 最大值，默认为255
     * @returns {ImgArray} 截断后的结果
     */
    clamp(vmin = 0, vmax = 255) {
        return this.vectorize(x => x < vmin ? vmin : (x > vmax ? vmax : x));
    }

    /**
     * abs，对数组中的每个元素计算绝对值。返回一个与原数组尺寸相同的新数组，每个元素为原数组元素的绝对值。
     * @returns {ImgArray} 
     */
    abs() {
        return this.vectorize(x => Math.abs(x));
    }

    /**
     * square，计算数组中每个元素的平方。
     * @returns {ImgArray} 平方结果
     */
    square() {
        return this.vectorize(x => x * x);
    }

    /**
     * pow，幂运算，计算数组中每个元素的幂。
     * @param {number} value - 幂数
     * @returns {ImgArray} 幂运算结果
     */
    pow(value) {
        return this.vectorize(x => Math.pow(x, value));
    }

    /**
     * ReLU函数，将小于value的元素变成value，大于value的不变
     * @param {number} [value=0] - 阈值，默认为0
     * @returns {ImgArray} ReLU函数结果
     */
    relu(value = 0) {
        return this.vectorize(x => x < value ? value : x);
    }

    /**
     * opposite，取反，即每个元素取负
     * @returns {ImgArray} 取反结果
     */
    opposite() {
        return this.vectorize(x => -x);
    }

    /**
     * vectorizemath，对Math中的函数进行运算
     * @returns {ImgArray} 函数运算结果
     */
    vectorizemath(func = Math.sin, ...params) {
        //可以看成是一个母函数，只要是调用了Math的函数，都可以用这个函数，
        //例如：前面的pow()方法，写成vectorizemath(Math.pow,y)
        //例如：前面的abs()方法，写成vectorizemath(Math.abs)
        return this.vectorize(x => func(x, ...params))
    }


    /**
     * todo:分成5个函数，分别对应不同的阈值处理方式
     * @param {number} [threshold=100] - 阈值，默认为100
     * @param {string} [method='binary'] - 阈值处理方式，默认为'binary'，可选值有'binary'、'truncate'、'binary_inv'、'tozero'、'tozero_inv'
     * @param {number} [maxval=255] - 最大值，默认为255
     * @returns {ImgArray} 阈值处理结果
     */
    threshold(threshold = 100, method = 'binary', maxval = 255) {
        if (method == 'binary') {
            //二值化
            return this.vectorize((x) => { return x > threshold ? maxval : 0 })
        }
        else if (method == 'truncate') {
            //截断化
            return this.vectorize((x) => { return x > threshold ? threshold : x })
        }
        else if (method == 'binary_inv') {
            //二值化（反转）
            return this.vectorize((x) => { return x > threshold ? 0 : maxval })
        }
        else if (method == 'tozero') {
            //归零化
            return this.vectorize((x) => { return x > threshold ? x : 0 })
        }
        else if (method == 'tozero_inv') {
            //归零化（反转） 
            return this.vectorize((x) => { return x > threshold ? 0 : x })
        }
    }

    /**
     * span 区间变换
     * @param {number} lower - 下限
     * @param {number} upper - 上限
     * @param {number} [vmin=0] - 最小值，默认为0
     * @param {number} [vmax=255] - 最大值，默认为255
     * @returns {ImgArray} 区间变换结果
     */
    span(lower, upper, vmin = 0, vmax = 255) {
        //区间变换
        let func = (x) => {
            if (x >= upper) return vmax;
            if (x <= lower) return vmin;
            return (x - lower) / (upper - lower) * (vmax - vmin) + vmin;
        }
        return this.vectorize(func);
    }

    /**
     * globalminmax，获取整个数组的最小值和最大值
     * @returns {Object} 包含最小值和最大值的对象
     */
    globalminmax() {
        //获取整个数组的最小值和最大值
        let minv = this.data[0];
        let maxv = this.data[0];
        this.data.forEach((x) => {
            if (x < minv) {
                minv = x;
                return
            }
            if (x > maxv) {
                maxv = x;
                return
            }
        });
        return { minv, maxv };
    }

    /**
     * stretch，拉伸到指定的数值范围内
     * @param {number} [vmin=0] - 最小值，默认为0
     * @param {number} [vmax=255] - 最大值，默认为255
     * @returns {ImgArray} 拉伸后的结果
     */
    stretch(vmin = 0, vmax = 255) {
        //拉伸到指定的数值范围内
        let { minv, maxv } = this.globalminmax();
        if (minv == maxv) {
            return this.copy().fill((vmin + vmax) / 2);
        }
        else {
            return this.vectorize((x) => { return (x - minv) / (maxv - minv) * (vmax - vmin) + vmin });
        }
    }

    /**
     * pad，对高和宽进行常数填充的扩边操作,顺序是左上右下
     * @param {Object} options - 填充选项
     * @param {number} [options.l=1] - 左边填充的个数，默认为1
     * @param {number} [options.r=2] - 右边填充的个数，默认为2
     * @param {number} [options.t=3] - 上边填充的个数，默认为3
     * @param {number} [options.b=4] - 下边填充的个数，默认为4
     * @param {number} [options.fillvalue=0] - 填充的值，默认为0
     * @returns {ImgArray} 返回一个新的 `ImgArray` 实例，包含填充后的数据。
     */
    pad({ l = 1, r = 2, t = 3, b = 4, fillvalue = 0 } = {}) {
        let newheight = this.height + t + b;
        let newwidth = this.width + l + r;
        let newarr = new ImgArray({ height: newheight, width: newwidth, channel: this.channel }).fill(fillvalue);
        for (let hidx = t; hidx < this.height + t; hidx++) {
            for (let widx = l; widx < this.width + l; widx++) {
                for (let cidx = 0; cidx < this.channel; cidx++) {
                    let ohidx = hidx - t;
                    let owidx = widx - l;
                    let tmpv = this.getel(ohidx, owidx, cidx);
                    newarr.setel(hidx, widx, cidx, tmpv);
                }
            }
        }
        return newarr;
    }

    /**
     * slice，对高和宽进行切片操作
     * @param {number} sthidx - 高的起始位置（不包含结束位置）
     * @param {number} edhidx - 高的结束位置（不包含结束位置）
     * @param {number} stwidx - 宽的起始位置（不包含结束位置）
     * @param {number} edwidx - 宽的结束位置（不包含结束位置）
     * @returns {ImgArray} 返回一个新的 `ImgArray` 实例，包含切片后的数据。
     */
    slice(sthidx, edhidx, stwidx, edwidx) {
        //参数含义分别别是高的起始和结束位置（不包含结束位置），宽的起始和结束位置（不包含结束位置）
        //返回一个新的ImgArray对象
        if (this.checkisvalid(sthidx, stwidx, 0) && this.checkisvalid(edhidx - 1, edwidx - 1, 0)) {
            let newheight = edhidx - sthidx;
            let newwidth = edwidx - stwidx;
            let newimgarr = new ImgArray({ height: newheight, width: newwidth, channel: this.channel });
            for (let hidx = 0; hidx < newheight; hidx++) {
                for (let widx = 0; widx < newwidth; widx++) {
                    for (let cidx = 0; cidx < this.channel; cidx++) {
                        let tmpv = this.getel(hidx + sthidx, widx + stwidx, cidx);
                        newimgarr.setel(hidx, widx, cidx, tmpv);
                    }
                }
            }
            return newimgarr;
        }
        console.error('数组索引越界。')
    }

    /**
     * structure，按照结构元素进行邻域展开
     * @param {Array} pattern - 结构元素，是一个二维数组，表示邻域的形状
     * @param {number} [fillvalue=0] - 填充的值，默认为0
     * @returns {ImgArray} 返回一个新的 `ImgArray` 实例，包含邻域展开后的数据。
     */
    structure(pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]], fillvalue = 0) {
        let kernelheight = pattern.length;
        let kernelwidth = pattern[0].length;

        let pady = Math.floor(kernelheight / 2);
        let padx = Math.floor(kernelwidth / 2);

        let padimgar = this.pad({ l: padx, t: pady, r: padx, b: pady, fillvalue });
        let imgarrs = [];
        for (let idxh = 0; idxh < kernelheight; idxh++) {
            for (let idxw = 0; idxw < kernelwidth; idxw++) {
                if (pattern[idxh][idxw] == 0) continue;
                imgarrs.push(padimgar.slice(idxh, idxh + this.height, idxw, idxw + this.width));
            }
        }
        let [baseimg, ...resimgs] = imgarrs;
        return baseimg.dstack(...resimgs);
    }

    /**
     * neighbor，按尺寸进行邻域展开,sizes是2个元素组成的数组，表示邻域的高和宽，里边应当是奇数
     * 该方法实际上不操作，只生成pattern，调用strcuture完成邻域的生成
     * @param {number[]} [sizes = [3, 3]] - 邻域的尺寸，是一个2个元素的数组，表示邻域的高和宽
     * @param {number} [fillvalue=0] - 填充的值，默认为0
     * @returns {ImgArray} 返回一个新的 `ImgArray` 实例，包含邻域展开后的数据。
     */
    neighbor(sizes = [3, 3], fillvalue = 0) {
        let pt = [];
        for (let idxh = 0; idxh < sizes[0]; idxh++) {
            pt.push(Array(sizes[1]).fill(1));
        }
        return this.structure(pt, fillvalue);
    }

    /**
     * apply_along_channel，沿通道的运算
     * @param {function} func - 一回调函数接收一个一维数组，返回一个数值
     * @returns {ImgArray} 返回一个新的 `ImgArray` 实例，包含运算后的数据。
     */
    apply_along_channel(func) {
        let outimgarr = new ImgArray({ height: this.height, width: this.width, channel: 1 });
        for (let idxh = 0; idxh < this.height; idxh++) {
            for (let idxw = 0; idxw < this.width; idxw++) {
                let stidx = this.idxtoelidx(idxh, idxw, 0);
                let data = this.data.slice(stidx, stidx + this.channel);
                let value = func(data);
                outimgarr.setel(idxh, idxw, 0, value);
            }
        }
        return outimgarr;
    }

    /**
     * mean，计算均值
     * @param {boolean} [ischannel=false] - 当ischannel为True时，沿通道计算均值，否则计算全局均值
     * @returns {number|ImgArray} 返回一个数值或一个新的 `ImgArray` 实例，包含均值或均值数组。
     */
    mean(ischannel = false) {
        if (ischannel) {
            let func = (x) => { return x.reduce((prev, curr) => { return prev + curr }) / x.length };
            return this.apply_along_channel(func);
        }
        return this.data.reduce((prev, curr) => { return prev + curr }) / this.data.length;
    }

    /**
     * max，计算最大值,膨胀，最大值池化
     * @param {boolean} [ischannel=false] - 当ischannel为True时，沿通道计算最大值，否则计算全局最大值
     * @returns {number|ImgArray} 返回一个数值或一个新的 `ImgArray` 实例，包含最大值或最大值数组。
     */
    max(ischannel = false) {
        if (ischannel) {
            let func = (x) => { return Math.max(...x) }
            return this.apply_along_channel(func);
        }
        let maxv = this.data[0];
        this.data.forEach((x) => { if (x > maxv) maxv = x });
        return maxv;
    }

    /**
     * min，计算最小值,腐蚀，最小值池化
     * @param {boolean} [ischannel=false] - 当ischannel为True时，沿通道计算最小值，否则计算全局最小值
     * @returns {number|ImgArray} 返回一个数值或一个新的 `ImgArray` 实例，包含最小值或最小值数组。
     */
    min(ischannel = false) {
        if (ischannel) {
            let func = (x) => { return Math.min(...x) }
            return this.apply_along_channel(func)
        }
        let minv = this.data[0];
        this.data.forEach((x) => { if (x < minv) minv = x });
        return minv;
    }

    /**
     * linearc，线性加权
     * @param {number[]} [weights = [1, 2, 3]] - 线性加权系数，是一个一维数组，表示每个通道的权重
     * @param {number} [bais=0] - 偏差值，默认为0
     * @returns {ImgArray} 返回一个新的 `ImgArray` 实例，包含线性加权后的数据。
     */
    linearc(weights = [1, 2, 3], bais = 0) {
        //判断weights的长度与通道数相同
        let func = (x) => {
            let res = 0
            for (let i = 0; i < weights.length; i++) {
                res += x[i] * weights[i]
            }
            return res + bais
        }
        return this.apply_along_channel(func)
    }

    /**
     * conv2d，卷积运算,weights卷积
     * @param {number[][]} [weights = [[1/9, 1/9, 1/9], [1/9, 1/9, 1/9], [1/9, 1/9, 1/9]]] - 卷积核，是一个二维数组，表示卷积核的权重
     * @param {number} [bias=0] - 偏差值，默认为0
     * @param {number} [fillvalue=0] - 填充的值，默认为0
     * @returns {ImgArray} 返回一个新的 `ImgArray` 实例，包含卷积运算后的数据。
     */
    conv2d(weights = [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]], bias = 0, fillvalue = 0) {
        //卷积运算，只对通道数为1的数组有效
        let size = [weights.length, weights[0].length]
        let nb = this.neighbor(size, fillvalue)
        return nb.linearc(weights.flat(), bias)
    }

    /**
     * median，中值滤波，对通道数为1的数组结果正确
     * @param {number[][]} [sizes = [3, 3]] - 邻域大小，是一个二维数组，表示邻域的大小
     * @param {number} [fillvalue=0] - 填充的值，默认为0
     * @returns {ImgArray} 返回一个新的 `ImgArray` 实例，包含中值滤波后的数据。
     */
    median(sizes = [3, 3], fillvalue = 0) {
        let tmparr = this.neighbor(sizes, fillvalue)
        /**
         * 计算数组的中值。
         * 对传入的数组进行排序并计算中值。如果数组长度是偶数，则返回中间两个元素的平均值。
         * @param {number[]} arr - 需要计算中值的数组。
         * @returns {number} 返回中值。
         */
        function calcmedian(arr) {
            arr.sort((a, b) => a - b);
            const mid = Math.floor(arr.length / 2);
            if (arr.length % 2 === 0) {
                return (arr[mid - 1] + arr[mid]) / 2;
            } else {
                return arr[mid];
            }
        }
        return tmparr.apply_along_channel(calcmedian);
    }

    /**
     * gaussianBlur,应用高斯模糊。
     * 该方法生成一个高斯核，并将其应用于图像数据，实现高斯模糊效果。
     * @param {number} [sigma=2] - 高斯核的标准差，控制模糊的程度。默认为 `2`。
     * @param {number[]} [kernel_size=[3, 3]] - 高斯核的尺寸，默认为 `[3, 3]`。尺寸应该为奇数。
     * @param {number} [fillvalue=0] - 邻域填充的默认值，默认为 `0`。
     * @returns {ImgArray} 返回一个新的图像数据对象，应用了高斯模糊。
     */
    gaussianBlur(sigma = 2, kernel_size = [3, 3], fillvalue = 0) {
        let tmparr = this.neighbor(kernel_size, fillvalue)
        /**
         * 创建高斯核。
         * 根据给定的标准差和核大小生成一个高斯核，并进行归一化处理。
         * @param {number} sigma - 高斯核的标准差。
         * @param {number[]} kernel_size - 高斯核的尺寸。
         * @returns {number[][]} 返回一个归一化的高斯核。
         */
        function creategausskernel(sigma, kernel_size) {
            let kernel = [];
            let center = Math.floor(kernel_size[0] / 2);
            for (let i = 0; i < kernel_size[0]; i++) {
                let row = [];
                for (let j = 0; j < kernel_size[1]; j++) {
                    let x = i - center;
                    let y = j - center;
                    let value = (1 / (2 * Math.PI * sigma * sigma)) * Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                    row.push(value);
                }
                kernel.push(row);
            }
            // 归一化
            let sum = kernel.reduce((a, b) => a.concat(b)).reduce((a, b) => a + b);
            for (let i = 0; i < kernel_size[0]; i++) {
                for (let j = 0; j < kernel_size[1]; j++) {
                    kernel[i][j] /= sum;
                }
            }
            return kernel;
        }
        return tmparr.conv2d(creategausskernel(sigma, kernel_size));
    }

    /**
     * sobelx,对图像应用 Sobel 算子，计算图像在 X 方向上的梯度。
     * @returns {ImgArray} 返回计算后的图像数据对象。
     */
    sobelx() {
        let kernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        return this.conv2d(kernel);
    }

    /**
      * sobely,对图像应用 Sobel 算子，计算图像在 Y 方向上的梯度。
      * @returns {ImgArray} 返回计算后的图像数据对象。
      */
    sobely() {
        let kernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
        return this.conv2d(kernel)
    }

    /**
     * sobelxy,计算图像的梯度幅值，结合 Sobel X 和 Sobel Y 方向的梯度。
     * @returns {ImgArray} 返回图像的梯度幅值。
     */
    sobelxy() {
        return this.sobelx().abs().add(this.sobely().abs());
    }

    /**
     * laplacian,应用拉普拉斯算子对图像进行边缘检测。
     * @param {number} [size=4] - 拉普拉斯核的大小，默认为 `4`。
     * @returns {ImgArray} 返回一个新的图像数据对象，应用了拉普拉斯算子。
     */
    laplacian(size = 4) {
        let kernel4 = [[0, -1, 0], [-1, 4, -1], [0, -1, 0]];
        let kernel8 = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
        let kernel = size == 4 ? kernel4 : kernel8;
        return this.conv2d(kernel)
    }

    /**
     * sharrx,对图像应用 Sobel 算子，计算图像在 X 方向上的梯度。
     * @returns {ImgArray} 返回计算后的图像数据对象。
     */
    sharrx() {
        let kernel = [[-3, 0, 3], [-10, 0, 10], [-3, 0, 3]];
        return this.conv2d(kernel);
    }

    /**
     * sharry,对图像应用 Sobel 算子，计算图像在 Y 方向上的梯度。
     * @returns {ImgArray} 返回计算后的图像数据对象。
     */
    sharry() {
        let kernel = [[-3, -10, -3], [0, 0, 0], [3, 10, 3]];
        return this.conv2d(kernel);
    }

    /**
     * sharrxy,计算图像的梯度幅值，通过结合 Sobel X 和 Sobel Y 方向的梯度计算结果。
     * @returns {ImgArray} 返回图像的梯度幅值。
     */
    sharrxy() {
        return this.sharrx().abs().add(this.sharry().abs());
    }

    /**
     * prewittx,对图像应用 Prewitt 算子，计算图像在 X 方向上的梯度。
     * @returns {ImgArray} 返回计算后的图像数据对象。
     */
    prewittx() {
        let kernel = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
        return this.conv2d(kernel);
    }
    /**
     * prewitty,对图像应用 Prewitt 算子，计算图像在 Y 方向上的梯度。
     * @returns {ImgArray} 返回计算后的图像数据对象。
     */
    prewitty() {
        let kernel = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
        return this.conv2d(kernel)
    }
    /**
     * prewittxy,计算图像的梯度幅值，结合 Prewitt X 和 Prewitt Y 方向的梯度。
     * @returns {ImgArray} 返回图像的梯度幅值。
     */
    prewittxy() {
        return this.prewittx().abs().add(this.prewitty().abs());
    }

    //canny算子，有问题
    /**
     * canny,应用 Canny 算子。对图像进行边缘检测
     * @returns {ImgArray} 返回一个新的图像数据对象，应用了 Canny 算子。
     */
    canny() {
        let tmparr = this.structure([[1, 1, 1], [1, -7, 1], [1, 1, 1]], 0)
        return tmparr.conv2d(creategausskernel(1, 3))
    }

    /**
     * maxpooling,应用最大值池化对图像进行降采样。
     * @param {number[]} [size=[3, 3]] - 池化核的大小，默认为 `[3, 3]`。
     * @param {number} [fillvalue=0] - 填充值，默认为 `0`。
     * @returns {ImgArray} 返回一个新的图像数据对象，应用了最大值池化。
     */
    maxpooling(size = [3, 3], fillvalue = 0) {
        //最大值池化
        let tmparr = this.neighbor(size, fillvalue);
        return tmparr.max(true);
    }

    /**
     * minpooling，应用最小值池化对图像进行降采样。
     * @param {number[]} [size=[3, 3]] - 池化核的大小，默认为 `[3, 3]`。
     * @param {number} [fillvalue=0] - 填充值，默认为 `0`。
     * @returns {ImgArray} 返回一个新的图像数据对象，应用了最小值池化。
     */
    minpooling(size = [3, 3], fillvalue = 0) {
        //最小值池化
        let tmparr = this.neighbor(size, fillvalue);
        return tmparr.min(true);
    }

    /**
     * avgpooling，应用平均值池化对图像进行降采样。
     * @param {number[]} [size=[3, 3]] - 池化核的大小，默认为 `[3, 3]`。
     * @param {number} [fillvalue=0] - 填充值，默认为 `0`。
     * @returns {ImgArray} 返回一个新的图像数据对象，应用了平均值池化。
     */
    avgpooling(size = [3, 3], fillvalue = 0) {
        //平均池化（均值滤波）
        let tmparr = this.neighbor(size, fillvalue);
        return tmparr.mean(true);
    }

    /**
     * dilate，膨胀操作，使用给定的结构元素对图像进行膨胀。
     * @param {number[][]} [pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]]] - 膨胀操作的结构元素，通常是一个矩阵，表示膨胀的形状和大小。默认为 3x3 的邻域。
     * @param {number} [filfillvalue = 0] - 膨胀操作中填充区域的值，默认为 0。
     * @returns {ImgArray} 返回膨胀后的图像数据对象。
     */
    dilate(pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]], fillvalue = 0) {
        let tmparr = this.structure(pattern, fillvalue);
        return tmparr.max(true);
    }

    /**
     * erode，腐蚀操作，使用给定的结构元素对图像进行腐蚀。
     * @param {number[][]} [pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]]] - 腐蚀操作的结构元素，通常是一个矩阵，表示腐蚀的形状和大小。默认为 3x3 的邻域。
     * @param {number} [fillvalue = 0] - 腐蚀操作中填充区域的值，默认为 0。
     * @returns {ImgArray} 返回腐蚀后的图像数据对象。
     */
    erode(pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]], fillvalue = 0) {
        let tmparr = this.structure(pattern, fillvalue);
        return tmparr.min(true);
    }

    /**
     * mgradient，形态学梯度操作，使用给定的结构元素对图像进行形态学梯度操作。
     * @param {number[][]} [sizes = [3, 3]] - 形态学梯度操作的结构元素，通常是一个矩阵，表示形态学梯度的形状和大小。默认为 3x3 的邻域。
     * @param {number} [fillvalue = 0] - 形态学梯度操作中填充区域的值，默认为 0。
     * @returns {ImgArray} 返回形态学梯度后的图像数据对象。
     */
    mgradient(sizes = [3, 3], fillvalue = 0) {
        let tmparr = this.neighbor(sizes, fillvalue);
        return tmparr.max(true).sub(tmparr.min(true));
    }

    /**
     * open，开运算操作，使用给定的结构元素对图像进行开运算。
     * @param {number[][]} [pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]]] - 开运算的结构元素，通常是一个矩阵，表示开运算的形状和大小。默认为 3x3 的邻域。
     * @param {number} [fillvalue = 0] - 开运算中填充区域的值，默认为 0。
     * @returns {ImgArray} 返回开运算后的图像数据对象。
     */
    open(pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]], fillvalue = 0) {
        return this.erode(pattern, fillvalue).dilate(pattern, fillvalue);
    }

    /**
     * close，闭运算操作，使用给定的结构元素对图像进行闭运算。
     * @param {number[][]} [pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]]] - 闭运算的结构元素，通常是一个矩阵，表示闭运算的形状和大小。默认为 3x3 的邻域。
     * @param {number} [fillvalue = 0] - 闭运算中填充区域的值，默认为 0。
     * @returns {ImgArray} 返回闭运算后的图像数据对象。
     */
    close(pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]], fillvalue = 0) {
        return this.dilate(pattern, fillvalue).erode(pattern, fillvalue);
    }

    /**
     * tophat，顶帽运算，使用给定的结构元素对图像进行顶帽运算。
     * @param {number[][]} [pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]]] - 顶帽运算的结构元素，通常是一个矩阵，表示顶帽运算的形状和大小。默认为 3x3 的邻域。
     * @param {number} [fillvalue = 0] - 顶帽运算中填充区域的值，默认为 0。
     * @returns {ImgArray} 返回顶帽运算后的图像数据对象。
     */
    tophat(pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]], fillvalue = 0) {
        return this.sub(this.open(pattern, fillvalue));
    }

    /**
     * blackhat，黑帽运算，使用给定的结构元素对图像进行黑帽运算。
     * @param {number[][]} [pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]]] - 黑帽运算的结构元素，通常是一个矩阵，表示黑帽运算的形状和大小。默认为 3x3 的邻域。
     * @param {number} [fillvalue = 0] - 黑帽运算中填充区域的值，默认为
     * @returns {ImgArray} 返回黑帽运算后的图像数据对象。
     */
    blackhat(pattern = [[1, 1, 1], [0, 1, 0], [1, 1, 1]], fillvalue = 0) {
        return this.close(pattern, fillvalue).sub(this);
    }

    /**
     * adaptiveThreshold，自适应阈值分割，使用给定的结构元素对图像进行自适应阈值分割。
     * @param {number[][]} [sizes = [3, 3]] - 自适应阈值分割的结构元素，通常是一个矩阵，表示自适应阈值分割的形状和大小。默认为 3x3 的邻域。
     * @param {number} [fillvalue = 0] - 自适应阈值分割中填充区域的值，默认为 0。
     * @param {number} [constant = 0] - 自适应阈值分割的常数，默认为 0。
     * @returns {ImgArray} 返回自适应阈值分割后的图像数据对象。
     */
    adaptiveThreshold(sizes = [3, 3], fillvalue = 0, constant = 0) {
        //自适应阈值分割，后续讨论，有问题
        let tmparr = this.neighbor(sizes, fillvalue);
        let res = new Tensor(this.width, this.height);
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                let sum = 0;
                for (let m = 0; m < sizes[0]; m++) {
                    for (let n = 0; n < sizes[1]; n++) {
                        sum += tmparr.get(m, n);
                    }
                }
                let mean = sum / (sizes[0] * sizes[1]);
                res.set(i, j, this.get(i, j) > mean - constant ? 1 : 0);
            }
        }
        return res;
    }

    /**
     * lbp，计算经典的局部二值模式（LBP）特征。
     * LBP 用于描述图像的局部纹理特征，常用于图像分类和面部识别等任务。
     * @returns {ImgArray} 返回包含 LBP 特征的图像数据对象。
     */
    lbp() {
        let tmparr = this.neighbor([3, 3], 0);
        /**
         * 计算 LBP 特征的函数
         * @param {number[]} x - 包含 9 个元素的数组，表示 3x3 邻域的像素值。
         * @returns {number} 返回计算后的 LBP 特征值（十进制）。
         */
        function calclbp(x) {
            let tmpnew = 0;
            let weights = [128, 64, 32, 1, 0, 16, 2, 4, 8];
            for (let i = 0; i < 9; i++) {
                if (x[i] > x[4]) {
                    tmpnew += weights[i];
                }
            }
            return tmpnew;
        }
        return tmparr.apply_along_channel(calclbp);
    }

    /**
     * lmi，计算 LMI 特征。
     * LMI 用于描述图像的局部纹理特征，常用于图像分类和面部识别等任务。
     * @param {number[][]} [sizes = [3, 3]] - LMI 特征的邻域大小，默认为 3x3 的邻域。
     * @returns {ImgArray} 返回包含 LMI 特征的图像数据对象。
     */
    lmi(sizes = [3, 3]) {
        let tmparr = this.neighbor(sizes, 0);
        let centerpos = Math.floor(tmparr.shape.channel / 2);
        /**
         * 计算 LMI 特征的函数
         * @param {number[]} x - 表示邻域的像素值。
         * @returns {number} 返回计算后的 LMI 特征值（十进制）。
         */
        function calclmi(x) {
            let tmpnew = 0;
            let centvalue = x[centerpos];
            for (let i = 0; i < x.length; i++) {
                if (x[i] < centvalue) {
                    tmpnew += 1;
                }
            }
            return tmpnew;
        }
        return tmparr.apply_along_channel(calclmi);
    }

    /**
     * cellsim，计算元胞自动机（Cellular Automaton）特征。
     * 元胞自动机是一种描述自然界中复杂规则的数学模型，常用于图像处理和计算机视觉等应用。
     * @param {number[][]} [sizes = [3, 3]] - 元胞自动机特征的邻域大小，默认为 3x3 的邻域。
     * @returns {ImgArray} 返回包含元胞自动机特征的图像数据对象。
     */
    cellsim(sizes = [3, 3]) {
        //元胞自动机，生命游戏
        // 生命游戏规则：生命游戏是一种著名的二维元胞自动机，其规则非常简单，每个元胞根据其周围八个相邻元胞的状态来改变自己的状态，规则定义如下：
        // 如果一个元胞的状态为死亡（0），且周围有三个元胞的状态为存活（1），则该元胞下一个状态为存活（1）；
        // 如果一个元胞的状态为存活（1），且周围有两个或三个元胞的状态也为存活（1），则该元胞下一个状态仍为存活（1）；
        // 其他情况下，该元胞下一个状态为死亡（0）。
        let tmparr = this.neighbor(sizes, 0);
        function calcell(x) {
            let tmpnew = 0;
            let centerpos = Math.floor(x.length / 2);
            for (let i = 0; i < x.length; i++) {
                if (x[i] >= 0.5) {
                    tmpnew += 1;
                }
            }
            if (x[centerpos] >= 0.5) {
                if (tmpnew == 4 || tmpnew == 3)
                    return 1;
                else return 0;

            } else {
                if (tmpnew == 3)
                    return 1;
                else return 0;
            }
        }
        return tmparr.apply_along_channel(calcell);
    }

    /**
     * copy，复制当前图像数据对象，创建一个新副本。
     * @returns {ImgArray} 当前图像数据的副本。
     */
    copy() {
        let newarr = this.empty(true);
        newarr.data = this.data.slice();
        return newarr;
    }

    /**
     * empty，创建一个与当前图像数据对象相同尺寸的空数组，考虑了ImgArray和Img实例。
     * @param {boolean} [lazy = false] - 是否启用懒加载，默认为 false。
     * @returns {ImgArray} 创建的空数组。
     */
    empty(lazy = false) {
        if (this.constructor.name == "ImgArray") {
            return new ImgArray({
                height: this.height,
                width: this.width,
                channel: this.channel,
                lazy,
                dtype: this.dtype
            })
        }
        else {
            return new Img({
                height: this.height,
                width: this.width,
                lazy
            })
        }
    }

    /**
     * meshgrid，创建一个规则格网，用于在图像处理中生成网格特征。
     * @static
     * @param {number[]} [hrange = [0, 256]] - 格网在垂直方向的范围，默认为 [0, 256]。
     * @param {number[]} [wrange = [0, 256]] - 格网在水平方向的范围，默认为 [0, 256]。
     * @returns {ImgArray[]} 返回一个包含两个 ImgArray 对象的数组，其中第一个数组表示垂直方向的格网，第二个数组表示水平方向的格网。
     */
    static meshgrid(hrange = [0, 256], wrange = [0, 256]) {
        //产生规则格网
        let width = wrange[1] - wrange[0]
        let height = hrange[1] - hrange[0]
        let ximgarr = new ImgArray({ height, width, channel: 1 })
        let yimgarr = new ImgArray({ height, width, channel: 1 })
        for (let hidx = 0; hidx < height; hidx++) {
            for (let widx = 0; widx < width; widx++) {
                ximgarr.setel(hidx, widx, 0, widx + wrange[0]);
                yimgarr.setel(hidx, widx, 0, hidx + hrange[0]);
            }
        }
        return [yimgarr, ximgarr];
    }

    /**
     * random，创建一个指定尺寸的，指定范围的均值分布的数组。
     * @static
     * @param {Object} options - 创建数组的选项。
     * @param {number} [options.height=256] - 数组的高度，默认为 256。
     * @param {number} [options.width=256] - 数组的宽度，默认为 256。
     * @param {number} [options.channel=3] - 数组的通道数，默认为 3。
     * @param {number} [options.vmin=0] - 数组元素的最小值，默认为 0。
     * @param {number} [options.vmax=255] - 数组元素的最大值，默认为 255。
     * @returns {ImgArray} 返回一个 ImgArray 对象，表示创建的随机数组。
     */
    static random({ height = 256, width = 256, channel = 3, vmin = 0, vmax = 255 } = {}) {
        let newimgarr = new ImgArray({ height, width, channel, lazy: false });
        newimgarr.data = newimgarr.data.map(x => Math.random() * (vmax - vmin) + vmin);
        return newimgarr;
    }

    /**
     * zeros，创建一个指定尺寸的零数组。
     * @static
     * @param {Object} options - 创建数组的选项。
     * @param {number} [options.height=256] - 数组的高度，默认为 256。
     * @param {number} [options.width=256] - 数组的宽度，默认为 256。
     * @param {number} [options.channel=3] - 数组的通道数，默认为 3。
     * @returns {ImgArray} 返回一个 ImgArray 对象，表示创建的零数组。
     */
    static zeros({ height = 256, width = 256, channel = 3 } = {}) {
        return new ImgArray({ height, width, channel, lazy: false });
    }

    /**
     * ones，创建一个指定尺寸的 ones 数组。
     * @static
     * @param {Object} options - 创建数组的选项。
     * @param {number} [options.height=256] - 数组的高度，默认为 256。
     * @param {number} [options.width=256] - 数组的宽度，默认为 256。
     * @param {number} [options.channel=3] - 数组的通道数，默认为 3。
     * @returns {ImgArray} 返回一个 ImgArray 对象，表示创建的 ones 数组。
     */
    static ones({ height = 256, width = 256, channel = 3 } = {}) {
        return new ImgArray({ height, width, channel, lazy: false }).fill(1);
    }

    /**
     * full，创建一个指定尺寸的指定值数组。
     * @static
     * @param {Object} options - 创建数组的选项。
     * @param {number} [options.height=256] - 数组的高度，默认为 256。
     * @param {number} [options.width=256] - 数组的宽度，默认为 256。
     * @param {number} [options.channel=3] - 数组的通道数，默认为 3。
     * @param {number} [options.value=0] - 数组元素的值，默认为 0。
     * @returns {ImgArray} 返回一个 ImgArray 对象，表示创建的指定值数组。
     */
    static full({ height = 256, width = 256, channel = 3 } = {}, value = 0) {
        return new ImgArray({ height, width, channel, lazy: false }).fill(value);
    }

    /**
     * fromBuffer，从一个 ArrayBuffer 创建一个 ImgArray。
     * @static
     * @param {ArrayBuffer} arraybuffer - 用于创建 ImgArray 的 ArrayBuffer。
     * @param {ImgArray} shape - 创建 ImgArray 的形状。
     * @param {string} [dtype='float32'] - 创建 ImgArray 的数据类型，默认为 'float32'。
     * @returns {ImgArray} 返回一个ImgArray 对象，表示从 ArrayBuffer 创建的 ImgArray
     * @throws {Error} 如果 dtype 不是 ImgArray 支持的数据类型，则抛出异常。
     * @throws {Error} 如果 ArrayBuffer 的长度与 shape 不匹配，则抛出异常。
     */
    static fromBuffer(arraybuffer, shape, dtype = 'float32') {
        // arraybuffer创建ImgArray,假设buffer的排列方向是hwc，将buffer根据dtype转换为typedarray
        // 参照random函数，检查转换后的和shape个数一致
        let { height, width, channel } = shape;

        let type = ImgArray.dtypes[dtype];
        if (type == undefined) {
            throw new Error(`dtype ${dtype} is not supported, supported dtypes are ${ImgArray.dtypenames}`);
        }
        let bytesize = height * width * channel * type.BYTES_PER_ELEMENT;
        // 确保转换后的数组长度与期望的shape一致
        if (bytesize !== arraybuffer.byteLength) {
            throw new Error('长度不匹配');
        }
        let typedArray = new type(arraybuffer.slice()); //对arraybuffer拷贝
        // 创建ImgArray实例，并将数据赋值
        let newimgarr = new ImgArray({ height, width, channel, lazy: true });
        newimgarr.data = typedArray;
        return newimgarr;
    }

    /**
     * buffer，获取 ImgArray 的 ArrayBuffer。
     * @type {ArrayBuffer}
     */
    get buffer() {
        return this.data.buffer;
    }

    /**
     * typedarray，获取 ImgArray 的 TypedArray。
     * @type {TypedArray} 
     */
    get typedarray() {
        return this.data;
    }

    /**
     * fromArray，从一个数组创建一个 ImgArray。
     * @static
     * @param {Array} arr - 用于创建 ImgArray 的数组。
     * @param {ImgArray} shape - 创建 ImgArray 的形状。
     * @param {string} [dtype='float32'] - 创建 ImgArray 的数据类型，默认为 'float32'。
     * @returns {ImgArray} 返回一个ImgArray 对象，表示从数组创建的 ImgArray
     * @throws {Error} 如果数组的类型与 ImgArray 的类型不匹配，则抛出异常。
     */
    static fromArray(arr, shape, dtype = 'float32') {
        //从数组创建ImgArray，arr的类型typedarray或array,检查个数、长度、类型是否一致，多维array的话flatten为一维
        if (!Array.isArray(arr) && !ArrayBuffer.isView(arr)) {
            throw new Error('arr输入类型必须是：array or TypedArray');
        }
        let flatArray;
        if (Array.isArray(arr)) {
            // 展开数组
            flatArray = arr.flat(Infinity);     // 当 depth 设置为 Infinity 时,会将数组的所有嵌套层级全部展开
        } else {
            // 转换为普通数组
            flatArray = arr;
        }
        let { height, width, channel } = shape;
        if (flatArray.length !== height * width * channel) {
            throw new Error('长度不匹配');
        }
        let newimgarr = new ImgArray({ height, width, channel, lazy: true });
        newimgarr.data = new ImgArray.dtypes[dtype](flatArray);
        return newimgarr;
    }

    /**
     * dist，计算数组在通道方向与一个向量的欧氏距离。
     * @param {number[]} [v2 = [3, 4, 5]] - 用于计算距离的向量。
     * @returns {ImgArray} 返回一个 ImgArray 对象，表示计算得到的距离数组。
     */
    dist(v2 = [3, 4, 5]) {
        //计算数组在通道方向与一个向量的欧氏距离
        if (v2.length != this.channel) {
            console.error('数组长度与通道数不匹配。');
            return;
        }
        let func = (v1) => {
            let res = 0
            for (let i = 0; i < v2.length; i++) {
                res += (v1[i] - v2[i]) * (v1[i] - v2[i]);
            }
            return Math.sqrt(res);
        }
        return this.apply_along_channel(func)
    }

    /**
     * cossimdist，计算数组在通道方向与一个向量的余弦距离。
     * @param {number[]} [v2 = [3, 4, 5]] - 用于计算距离的向量。
     * @returns {ImgArray} 返回一个 ImgArray 对象，表示计算得到的距离数组。
     */
    cossimdist(v2 = [3, 4, 5]) {
        //计算数组在通道方向与一个向量的余弦距离
        if (v2.length != this.channel) {
            console.error('数组长度与通道数不匹配。');
            return;
        }
        let l2 = Math.hypot(...v2)
        let func = (v1) => {
            let res = 0
            for (let i = 0; i < v2.length; i++) {
                res += v1[i] * v2[i]
            }
            return 1 - res / (l2 * Math.hypot(...v1) + 0.0000001)
        }

        return this.apply_along_channel(func)
    }

    /**
     * kmeans，使用 K 均值聚类算法对图像数据进行聚类。
     * @param {number} k - 聚类的数量。
     * @param {Array<Array<number>> | null} centers - 初始聚类中心，是一个二维数组（kxchannel）。如果为 `null`，程序将随机选择初始中心。
     * @param {string} [disttype='dist'] - 距离度量方式，可选值为 'dist'（欧氏距离）或 'cossimdist'（余弦相似度）。
     * @returns {Array} 返回两个值：
     * - `newcenters`：更新后的聚类中心。
     * - `clusterresult`：一个 ImgArray 对象，表示每个像素的聚类结果。
     */
    kmeans(k = 4, centers = null, disttype = 'dist') {
        //k均值聚类
        //k表示聚类数量,
        //centers是一个kxchannel的二维列表构成的数组，表示k个聚类中心，当为null时程序自动随机选择
        //disttype是距离度量方式可以为dist或者是cossimdist,
        //初始化聚类中心
        if (centers === null) {
            centers = []
            for (let i = 0; i < k; i++) {
                let tmpx = parseInt(Math.random() * this.width)
                let tmpy = parseInt(Math.random() * this.height)
                let idx = this.idxtoelidx(tmpy, tmpx, 0)
                let v2 = this.data.slice(idx, idx + this.channel)
                v2 = Array.from(v2)
                centers.push(v2)
            }
        }
        else {
            k = centers.length
        }
        //对聚类中心按照特征值排一下序，保证不同的初始情况具有相似的聚类效果
        centers.sort((a, b) => Math.max(...a) - Math.max(...b))

        //计算像素到各中心的距离
        let dists = []
        for (let i = 0; i < k; i++) {
            let tmpdist = disttype == 'dist' ? this.dist(centers[i]) : this.cossimdist(centers[i])
            dists.push(tmpdist)
        }
        //计算聚类结果
        let clusternum = Array(k).fill(0)
        let newcenters = Array(k)
        for (let i = 0; i < k; i++) {
            newcenters[i] = new Array(this.channel).fill(0);
        }

        let clusterresult = new ImgArray({ height: this.height, width: this.width, channel: 1, lazy: false, dtype: 'cuint8' })
        for (let i = 0; i < dists[0].data.length; i++) {
            let minv = Infinity;
            let minidx = 0;
            for (let idx = 0; idx < dists.length; idx++) {
                if (dists[idx].data[i] < minv) {
                    minv = dists[idx].data[i]
                    minidx = idx
                }
            }
            //console.log(minv,minidx)
            clusterresult.data[i] = minidx
            clusternum[minidx] += 1  //类别计数器加1
            let [h, w, c] = dists[0].elidxtoidx(i)
            let idx = this.idxtoelidx(h, w, 0)
            let v2 = this.data.slice(idx, idx + this.channel)
            for (let idx = 0; idx < this.channel; idx++) {
                newcenters[minidx][idx] = v2[idx] + newcenters[minidx][idx]
            }

        }

        //更新聚类中心
        for (let idx = 0; idx < centers.length; idx++) {
            for (let i = 0; i < this.channel; i++) {
                newcenters[idx][i] = newcenters[idx][i] / clusternum[idx];
            }
        }
        return [newcenters, clusterresult]
    }

    /**
     * totensor，将数组转为onnxruntime中的张量。
     * @param {string} [dtype='float32'] - 张量数据类型，可以是 'float32' 或 'uint8'。
     * @returns {ort.Tensor} 返回一个张量对象。
     */
    totensor(dtype = 'float32') {
        if (typeof ort == 'undefined') console.error('需要加载onnnxruntime.js')
        if (dtype == 'float32')
            return new ort.Tensor(dtype, this.data.slice(), this.shape)
        if (dtype == 'uint8') {
            let imgardata = new Uint8Array(this.data)
            return new ort.Tensor(dtype, imgardata, this.shape)
        }
    }

    /**
     * fromtensor，将onnxruntime中的张量转为数组。
     * @static
     * @param {ort.Tensor} tensor - 张量对象。
     * @returns {ImgArray} 返回一个 ImgArray 对象。
     */
    static fromtensor(tensor) {
        let dim = tensor.dims.length;
        let arr = null;
        if (dim == 3)
            arr = new ImgArray(t.dims[0], t.dims[1], t.dims[2]);
        else
            arr = new ImgArray(t.dims[0], t.dims[1], 1);
        arr.data = new Float32Array(t.data);
        return arr;
    }

    /**
     * hwc2chw，用于将hxwxc转为cxhxw的方法，返回一个排列为cxhxw的一维float32数组
     * @returns {ImgArray} 返回一个形状为 CHW 格式的 ImgArray 对象。
     */
    hwc2chw() {
        let chs = this.dsplit();
        let res = new ImgArray({ height: this.channel, width: this.height, channel: this.width, dtype: this.dtype });
        for (let i = 0; i < chs.length; i++) {
            res.data.set(chs[i].data, i * chs[i].data.length);
        }
        return res;
    }

    /**
     * chw2hwc，将图像或数组的形状从 CHW 转换为 HWC 格式。
     * hwc2chw的逆操作,hwc2chw和chw2hwc都是transpose的简单化
     * @returns {ImgArray} 返回一个形状为 HWC 格式的 ImgArray 对象。
     */
    chw2hwc() {
        let { height, width, channel } = this.shape;
        let [c, h, w] = [height, width, channel];
        let baselen = h * w;
        let res = new ImgArray({ height: h, width: w, channel: c, dtype: this.dtype });
        let offsets = [];
        for (let i = 0; i < c; i++) {
            offsets.push(i * h * w);
        }
        for (let i = 0; i < baselen; i++) {
            let idx = i * c;
            for (let j = 0; j < c; j++) {
                let oidx = offsets[j] + i;
                res.data[idx + j] = this.data[oidx];
            }
        }
        return res;
    }

    /**
     * astype，将数组的元素类型转换为指定的类型，要注意不同类型数值表示范围差异可能带来的精度损失！
     * @param {string} [dtype='float32'] - 要转换的元素类型,变量{@link ImgArray.dtypenames}里的所有类型,如 'float32' ， 'uint8'等。
     * @returns {ImgArray} 返回一个具有指定元素类型的 ImgArray 对象。
     */
    astype(dtype = 'float32') {
        if (!ImgArray.dtypes[dtype]) {
            console.error('不支持的dtype类型');
            return;
        }
        let res = this.empty(true);
        res.data = new ImgArray.dtypes[dtype](this.data);
        res.dtype = dtype;
        return res;
    }

    /**
     * show，显示数组的内容，当数组为图像时，直接在网页中显示图像，方便观察。
     * 与matploblib的imshow很相似
     * @param {Object} options - 可选参数对象。
     * @param {number} [options.vmin=0] - 数组的最小值。
     * @param {number} [options.vmax=255] - 数组的最大值。
     * @param {number} [options.cas=null] - 可选的画布对象。
     * @returns {Img} 返回显示的图像对象。
     */
    show({ vmin = 0, vmax = 255, cas = null } = {}) {
        if ([1, 3, 4].includes(this.channel)) {
            let data = this.span(vmin, vmax, 0, 255);
            let img = Img.fromarray(data);
            img.show(cas);
            return img;   //返回显示的图像对象，从而可以调用其方法
        }
        else {
            console.error('array channel is not correct, channel should be 1(gray),3(RGB) or 4(RGBA)')
            console.error('数组的通道数不正确，当通道数是1（灰度）, 3（RGB彩色）, 或 4（带有透明通道的彩色图像）时才可以显示为图像！')
        }
    }

    /**
     * toString，参照Numpy的方式将数组转为字符显示，对于大数组的显示存在问题。
     * @returns {string} 数组的字符串表示
     */
    toString() {
        let str = `shape: [${this.height}, ${this.width}, ${this.channel}]\ndtype: ${this.dtype}\ndata :\n[`;
        for (let h = 0; h < this.height; h++) {
            let block = h ? ' [' : '[';
            for (let w = 0; w < this.width; w++) {
                let line = w ? '  [' : '[';
                for (let c = 0; c < this.channel; c++) {
                    let v = this.getel(h, w, c);
                    line += v.toFixed(2) + ' ';
                }
                if (w < this.width - 1)
                    block += line + ']\n';
                else
                    block += line + ']';
            }
            if (h < this.height - 1)
                str += block + ']\n\n';
            else
                str += block + ']';
        }
        return str + ']';
    }

    /**
     * 在控制台以格式化的字符串打印数组。
     */
    print() {
        console.log(this.toString())
    }

    /**
     * tofile，将数组保存为文件。*实验性质的方法，先解决有没有，后续根据需要再完善*
     * @param {string} [name='download'] - 文件名。
     * @param {string} [type='txt'] - 文件类型，可以是 'txt' 或 'bin'。
     */
    tofile(name = 'download', type = 'bin') {
        let buffer;

        if (type === 'txt') {
            let encoder = new TextEncoder();
            buffer = encoder.encode(this.data.toString());
        } else if (type === 'bin') {
            buffer = this.buffer;
        } else {
            console.error("Unsupported type specified");
            return;
        }

        let blob = new Blob([buffer]);
        let url = URL.createObjectURL(blob);

        const save_link = document.createElement("a");
        save_link.href = url;
        save_link.download = `${name}.${type}`;
        save_link.dataset.downloadurl = [type === 'txt' ? 'text/plain' : 'application/octet-stream', save_link.download, url].join(':');
        save_link.click();
        
        // 释放URL对象
        URL.revokeObjectURL(url);
    }
}

/**
 * ImgArray类是一个用于表示图像的类，继承自ImgArray类。
 * Img 继承自ImgArray类，虽然支持ImgArray的所有方法，但是不保证运行正确，
 * 更主要的是用于图像的存取和简单变换,Img 本身就是图像
 * Img的图像类型只支持RGBA排列一种
 * @extends ImgArray
 */
class Img extends ImgArray {
    /**
     * 创建一个Img对象。
     * @param {Object} options - 可选参数对象。
     * @param {number} [options.height=256] - 图像的高度。
     * @param {number} [options.width=256] - 图像的宽度。
     * @param {boolean} [options.lazy=false] - 是否延迟创建图像数据。
     * @returns {Img} 返回一个Img对象。
     */
    constructor({ height = 256, width = 256, lazy = false } = {}) {
        //调用父类ImgArray完成初始化
        super({ height, width, channel: 4, lazy, dtype: 'cuint8' });
        //创建一个保存图像的canvas
        let cas = document.createElement('canvas');
        this.cas = cas;
        this.cas.height = height;
        this.cas.width = width;
        this.ctx = cas.getContext('2d');
        this.iscasnew = false;  //用于标记图像数据和画布哪个新，要用新的去同步旧的
    }

    /**
     * update，更新图像数据到画布中，根据标志位进行数据和canvas同步。
     */
    update() {
        if (this.iscasnew) {
            let imgdata = this.ctx.getImageData(0, 0, this.cas.width, this.cas.height);
            this.data = imgdata.data.slice();
            this.iscasnew = false;
        }
        else {
            let imgdata = new ImageData(this.data, this.width, this.height)
            this.ctx.putImageData(imgdata, 0, 0)
        }
    }

    /**
     * fromarray，将 ImgArray 对象转换为 Img 对象。
     * 该方法支持灰度图 (channel = 1)、RGB 图 (channel = 3)、RGBA 图 (channel = 4) 的转换。
     * @static
     * @param {ImgArray} imgarray - 包含图像数据的 ImgArray 对象。
     * @param {number} imgarray.height - 图像的高度。
     * @param {number} imgarray.width - 图像的宽度。
     * @param {number} imgarray.channel - 图像的通道数：
     *     - 1 表示灰度图。
     *     - 3 表示 RGB 图。
     *     - 4 表示 RGBA 图。
     * @param {Uint8Array} imgarray.data - 一维数组，存储图像的像素值。
     *     - 若 `channel = 1`，数组长度为 height * width。
     *     - 若 `channel = 3`，数组长度为 height * width * 3。
     *     - 若 `channel = 4`，数组长度为 height * width * 4。
     * @returns {Img|null} - 转换后的 Img 对象（包含 RGBA 格式的像素值），或在不支持的通道数时返回 `null`。
     * @throws {Error} 如果 `imgarray.channel` 不是 1、3 或 4，则打印错误信息。
     */
    static fromarray(imgarray) {
        let img = null;
        let pixelnum = imgarray.data.length / imgarray.channel;
        if (imgarray.channel == 1) {
            img = new Img({ height: imgarray.height, width: imgarray.width });
            for (let i = 0; i < pixelnum; i += 1) {
                img.data[i * 4] = imgarray.data[i];
                img.data[i * 4 + 1] = imgarray.data[i];
                img.data[i * 4 + 2] = imgarray.data[i];
                img.data[i * 4 + 3] = 255;//不透明
            }
        } else if (imgarray.channel == 3) {
            img = new Img({ height: imgarray.height, width: imgarray.width });
            for (let i = 0; i < pixelnum; i += 1) {
                img.data[i * 4] = imgarray.data[i * 3];
                img.data[i * 4 + 1] = imgarray.data[i * 3 + 1];
                img.data[i * 4 + 2] = imgarray.data[i * 3 + 2];
                img.data[i * 4 + 3] = 255;
            }
        } else if (imgarray.channel == 4) {
            img = new Img({ height: imgarray.height, width: imgarray.width });
            img.data.set(imgarray.data);
        } else {
            console.error("不支持的通道数：" + imgarray.channel);
        }
        return img;
    }

    /**
     * fromcanvas，从canvas元素生成图像。
     * @static
     * @param {HTMLCanvasElement} canvasele - canvas元素。
     * @returns {Img} - 生成的图像对象。
     */
    static fromcanvas(canvasele) {
        let ctx = canvasele.getContext("2d");
        let imgdata = ctx.getImageData(0, 0, canvasele.width, canvasele.height);
        let oimg = new Img({ height: imgdata.height, width: imgdata.width, lazy: true });
        oimg.data = imgdata.data.slice();  //.slice() 复制数据
        return oimg
    }

    /**
     * fromimg，从图像元素生成图像。
     * @static
     * @param {HTMLImageElement} imgele - 图像元素。
     * @returns {Img} - 生成的图像对象。
     */
    static fromimg(imgele) {
        if (!imgele.width) {
            console.error('no image');
            return null;
        }
        let width = imgele.width
        let height = imgele.height
        let img = new Img({ width, height, lazy: true })
        img.ctx.drawImage(imgele, 0, 0, img.width, img.height);
        img.iscasnew = true;
        img.update()
        return img
    }
    /**
     * fromurl，从图像链接生成图像。
     * @static
     * @param {string} imgurl - 图像链接。
     * @returns {Promise<Img>} - 生成的图像对象，需要使用await。
     */
    static fromurl(imgurl) {
        return new Promise(function (r, e) {
            let img = new Image();
            img.src = imgurl;
            img.setAttribute('crossOrigin', '');//解决网络图片跨域的问题
            img.onload = (ex) => {
                r(Img.fromimg(img));
            }
            img.onerror = (ex) => { return e(ex) }
        })
    }

    /**
     * fromblob，从blob对象生成图像。
     * @static
     * @param {Blob} blob - blob对象。
     * @returns {Promise<Img>} - 生成的图像对象。
     */
    static fromblob(blob) {
        //返回是个promise对象，需要使用await
        //从编码的图像中生成图像，即将blob对象转为Image
        //测试代码：
        //fetch('/a.jpg').then(x=>{ return x.blob()}).then(b=>{return Img.fromblob(b)}).then(img=>{img.tocanvas(cas)})
        let src = URL.createObjectURL(blob)
        return this.fromurl(src)
    }

    /**
     * fromfile，从本地文件生成图像。
     * @static
     * @param {File} fileobj - 本地文件对象。
     * @returns {Promise<Img>} - 生成的图像对象。
     */
    static fromfile(fileobj) {
        //从本地文件生成图像
        /*
        使用方法
        html:
        <input type="file" id="fileInput">
        js:
        var finput=document.querySelector('#fileInput')
            finput.addEventListener('change',()=>{
                console.log(finput.files)
                let fileobj=finput.files[0]
                console.log(fileobj)
                Img.fromfile(fileobj).then((img)=>{
                    img.tocanvas(cas)})
            })
        */
        return new Promise(function (r, e) {
            const reader = new FileReader()
            // console.log(fileobj.type)
            if (!fileobj.type.startsWith('image')) return e('not image')
            reader.readAsDataURL(fileobj)

            reader.onload = () => {
                let url = reader.result
                r(Img.fromurl(url))
            }
        })
    }

    /**
     * fromvideo，从视频流生成图像。
     * @static
     * @param {HTMLVideoElement} videoele - 视频元素。
     * @param {number} [h] - 输出图像的高度。
     * @param {number} [w] - 输出图像的宽度。
     * @returns {Img} - 生成的图像对象。
     */
    static fromvideo(videoele, h = null, w = null) {
        //从video的视频流中截取图像
        let vcas = document.createElement('canvas');
        vcas.width = w ? w : videoele.videoWidth;
        vcas.height = h ? h : videoele.videoHeight;
        let context = vcas.getContext('2d');
        context.drawImage(videoele, 0, 0);
        return Img.fromcanvas(vcas);
    }

    /**
     * videotocanvas，在canvas element 上显示画布。
     * @static
     * @param {HTMLCanvasElement} canvasel - canvas元素。
     */
    static videotocanvas(canvasel) {
        //在canvas element 上显示画布
        let context = canvasel.getContext('2d');

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                var video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                video.addEventListener('loadedmetadata', function () {
                    canvasel.width = video.videoWidth;
                    canvasel.height = video.videoHeight;
                });

                function drawFrame() {
                    context.drawImage(video, 0, 0);
                    requestAnimationFrame(drawFrame);
                }
                requestAnimationFrame(drawFrame);
            })
            .catch(function (error) {
                console.log('无法获取视频流: ', error);
            });
    }

    /**
     * fromcamera，从摄像头头获取一幅图像。
     * @static
     * @param {number} [h] - 输出图像的高度。
     * @param {number} [w] - 输出图像的宽度。
     * @returns {Promise<Img>} - 生成的图像对象。
     */
    static fromcamera(h = null, w = null) {
        //从摄像头头获取一幅图像
        //返回是个promise对象，需要使用await
        return new Promise(function (r, e) {
            try {
                navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {

                    let video = document.createElement('video');
                    video.srcObject = stream;
                    video.play();
                    video.addEventListener('loadeddata', (e) => {
                        r(Img.fromvideo(video, h, w))
                    })
                });

            }
            catch (error) {
                e('打开相机失败！');
            }
        })
    }


    /**
     * tofile，将图像保存为文件。
     * @param {string} [name = 'download'] - 文件名。
     */
    tofile(name = 'download') {
        //将图像以指定名称保存，只支持png格式
        const save_link = document.createElement("a");
        save_link.href = this.tourl();
        save_link.download = name + '.png';
        save_link.dataset.downloadurl = ["image/png", save_link.download, save_link.href].join(':');
        save_link.click();
    }

    /**
     * tourl，将图像转为url。
     * @returns {string} - url
     */
    tourl() {
        //将图像转为url
        if (!this.iscasnew) this.update();
        return this.cas.toDataURL('image/png', 1);//图像不会被压缩
    }

    /**
     * toimg，将图像转为img标签元素在网页中展示出来。
     * @param {HTMLImageElement} imgele - img标签元素。
     */
    toimg(imgele) {
        //将Img转换为img标签元素在网页中展示出来
        let data = this.tourl()
        imgele.src = data
    }

    /**
     * tocanvas，将图像转为canvas标签元素在网页中展示出来。
     * @param {HTMLCanvasElement} canvasele - canvas标签元素。
     * @param {boolean} [isfull = false] - 是否使canvas适配图像。
     */
    tocanvas(canvasele, isfull = false) {
        if (this.iscasnew) this.update();
        //将Img转换为画布元素在网页中展示出来,需要canvasele的宽高与图像一致
        //需要使canvas适配图像的话将isfull置true
        if (isfull) {
            canvasele.width = this.width;
            canvasele.height = this.height;
        }
        let ctx = canvasele.getContext("2d");
        let imgdata = new ImageData(this.data, this.width, this.height)
        ctx.putImageData(imgdata, 0, 0)
    }

    /**
     * toarray，将图像转为数组。
     * @param {boolean} [droptrans = true] - 是否丢弃通道信息。
     * @returns {ImgArray} - 生成的数组对象。
     */
    toarray(droptrans = true) {
        //将图像转为数组,droptrans表示通道丢弃，即只保留RGB三个通道的数据
        if (this.iscasnew) this.update();
        let channel = droptrans ? 3 : 4;
        if (droptrans) {
            let oimgar = new ImgArray({ height: this.height, width: this.width, channel });
            oimgar.data.forEach((x, idx, arr) => { arr[idx] = this.data[parseInt(idx / 3) * 4 + idx % 3] }, this);
            return oimgar;
        }
        else {
            let oimgar = new ImgArray({ height: this.height, width: this.width, channel, lazy: true });
            oimgar.data = new Float32Array(this.data);
            return oimgar;
        }
    }

    /**
     * hist，获取直方图。
     * @param {number} [channel = 3] - 通道数。
     * @returns {Uint32Array|Array<Uint32Array>} - 生成的直方图。
     */
    hist(channel = 3) {
        //函数接收通道数(0,1,2),输入3时表示三通道的直方图
        if (typeof channel !== 'number' || channel < 0 || channel > 3) {
            throw new TypeError('Invalid channel parameter');
        }
        if (channel === 3) {
            let histList = [
                new Uint32Array(256),
                new Uint32Array(256),
                new Uint32Array(256)
            ];
            this.data.forEach(function (x, idx) {
                let c = idx % 4;
                if (c !== 3) {
                    histList[c][x]++;
                }
            });
            return histList;
        } else {
            let hist = new Uint32Array(256);
            this.data.forEach(function (x, idx) {
                if (idx % 4 === channel) {
                    if (hist[x] === undefined) {
                        hist[x] = 0;
                    }
                    hist[x]++;
                }
            });
            return hist;
        }
    }

    /**
     * getpixel，获取图像的像素值
     * @param {number} x - 像素的x坐标，横坐标
     * @param {number} y - 像素的y坐标，纵坐标
     * @returns {Uint8ClampedArray(4)} rgba，范围为0~255
     */
    getpixel(x, y) {
        let idx = this.idxtoelidx(y, x, 0);
        return this.data.slice(idx, idx + this.channel);
    }

    /**
     * setpixel，设置图像的像素值
     * @param {number} x - 像素的x坐标，横坐标
     * @param {number} y - 像素的y坐标，纵坐标
     * @param {number[]} [rgba = [0, 0, 0, 255]] ,元素值的范围要为0~255
     */
    setpixel(x, y, rgba = [0, 0, 0, 255]) {
        rgba = new Uint8ClampedArray(rgba);
        if (rgba.length > 4)
            rgba = rgba.slice(0, 4);
        let idx = this.idxtoelidx(y, x, 0);
        this.data.set(rgba, idx);
    }

    //试验性函数
    /**
     * applycolormap，将图像转灰度后，为灰度图像添加warm to cool的通过添加伪彩色warm to cool
     * cool to warm from vtkjs colormaps.json
     * 颜色映射的计算来自于vtkjs colormaps.json中的定义
     * @returns {Img} - 生成的图像对象。
     */
    applycolormap() {
        let colormap = new Map();
        function calc(x) {
            x = x / 255;
            let r, g, b;
            let wa, wb;
            if (x < 0.5) {
                wa = (0.5 - x) / 0.5
                wb = x / 0.5
                r = wa * 0.705882352941 + wb * 0.865;
                g = wa * 0.0156862745098 + wb * 0.865;
                b = wa * 149019607843 + wb * 0.865;
            }
            else {
                wa = (1 - x) / 0.5
                wb = (x - 0.5) / 0.5
                r = wa * 0.865 + wb * 0.23137254902;
                g = wa * 0.865 + wb * 0.298039215686;
                b = wa * 0.865 + wb * 0.752941176471;
            }
            return [r * 255, g * 255, b * 255]
        }
        for (let i = 0; i < 256; i++) {
            colormap.set(i, calc(i));
        }
        let outimg = this.empty(false);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let [r, g, b, a] = this.getpixel(x, y);
                [r, g, b] = colormap.get(parseInt((r + g + b) / 3));
                outimg.setpixel(x, y, [r, g, b, a]);
            }
        }
        return outimg;
    }

    /**
     * resize，将图像resize到指定大小
     * @param {number} [height = 256] - 输出图像的高度，默认为256。
     * @param {number} [width = 256] - 输出图像的宽度，默认为256。
     * @returns {Img} - 生成的图像对象。
     */
    resize(height = 256, width = 256) {
        if (!this.iscasnew) this.update();
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        //ctx.imageSmoothingEnabled = true;  // Enable interpolation
        ctx.drawImage(this.cas, 0, 0, this.width, this.height, 0, 0, width, height)
        return Img.fromcanvas(canvas)
    }

    /**
     * rotate，将图像旋转deg角度
     * @param {number} [deg = 45] - 旋转角度，默认为45度。
     * @returns {Img} - 生成的图像对象。
     */
    rotate(deg = 45) {
        if (!this.iscasnew) this.update();
        let angleInRadians = deg * Math.PI / 180; // 将角度转换为弧度
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        let ctx = canvas.getContext('2d');
        ctx.translate(this.cas.width / 2, this.cas.height / 2); // 将原点移动到图像中心
        ctx.rotate(-angleInRadians); // 旋转图像
        ctx.drawImage(this.cas, -this.width / 2, -this.height / 2); // 绘制旋转后的图像
        return Img.fromcanvas(canvas);
    }

    /**
     * opacity，设置图像不透明度，越大越不透明,取值0~255
     * @param {number} [value = 255] - 不透明度的值，默认为255。
     * @returns {Img} - 生成的图像对象。
     */
    opacity(value = 255) {
        //设置图像不透明度，越大越不透明,取值0~255
        //this.fill(value,3); 这种和下面的用哪种实现？
        if (this.iscasnew) this.update();
        this.data.forEach(function (x, idx, arr) { if (idx % 4 == 3) arr[idx] = value });
        return this;
    }

    /**
     * bitplane，计算比特面，cidx取哪个通道，bitnum取哪个比特位，返回值是0、1的数组Imgarray对象
     * @param {number} cidx - 取哪个通道，取值0~3。
     * @param {number} bitnum - 取哪个比特位，取值0~7。
     * @returns {Img} - 生成的图像对象。
     */
    bitplane(cidx, bitnum) {
        //计算比特面,cidx取哪个通道，bitnum取哪个比特位，返回值是0、1的数组Imgarray对象
        //this.dsplit或循环   this.vectorize  
        // 推荐双层循环，对宽和高进行遍历，通过使用getelement获取通道的值
        const bitplaneArray = new ImgArray({ height: this.height, width: this.width, channel: 1 })
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                //计算当前像素在data数组的索引
                //let index = this.idxtoelidx(y, x, cidx);
                //let val = this.data[index];              //获得指定通道的值
                let val = this.getel(y, x, cidx);
                const bitValue = (val >> bitnum) & 1;    //提取指定比特位的值
                //bitplaneArray.data[y * this.width + x] = bitValue * 255;
                bitplaneArray.setel(y, x, 0, bitValue * 255);
            }
        }
        return bitplaneArray;
    }

    /**
     * RGBtoYCbCr，将RGB图像转换为YCbCr图像
     * @returns {Img} - 生成的图像对象。
     */
    RGBtoYCbCr() {
        //将RGB图像转换为YCbCr图像
        // 创建一个与原始图像相同大小的新图像对象
        let ycbcrImg = new Img({ width: this.width, height: this.height, channel: this.channel });
        if (this.channel < 3) {
            console.error("该图像不是RGB图像，无法进行转换")
        }
        for (let i = 0; i < this.data.length; i += this.channel) {
            // 获取当前像素的RGB值
            let r = this.data[i];
            let g = this.data[i + 1];
            let b = this.data[i + 2];
            // 计算YCbCr值
            let y = 0.299 * r + 0.587 * g + 0.114 * b;
            let Cb = (-0.168736 * r - 0.331264 * g + 0.5 * b) + 128;
            let Cr = (0.5 * r - 0.418688 * g - 0.081312 * b) + 128;
            ycbcrImg.data[i] = y;
            ycbcrImg.data[i + 1] = Cb;
            ycbcrImg.data[i + 2] = Cr;
            ycbcrImg.data[i + 3] = this.data[i + 3];
        }
        // console.log(ycbcrImg);
        return ycbcrImg;
    }

    /**
     * YCbCrtoRGB，将YCbCr图像转换为RGB图像
     * @returns {Img} - 生成的图像对象。
     */
    YCbCrtoRGB() {
        let rgbImg = new Img({ width: this.width, height: this.height, channel: this.channel });
        if (this.channel < 3) {
            console.error("该图像无法转换为RGB图像")
        }
        for (let i = 0; i < this.data.length; i += this.channel) {
            // 获取当前像素的RGB值
            let y = this.data[i];
            let Cb = this.data[i + 1];
            let Cr = this.data[i + 2];
            // 计算YCbCr值
            let r = y + 1.402 * (Cr - 128);
            let g = y - 0.344136 * (Cb - 128) - 0.714136 * (Cr - 128);
            let b = y + 1.772 * (Cb - 128);
            rgbImg.data[i] = r;
            rgbImg.data[i + 1] = g;
            rgbImg.data[i + 2] = b;
            rgbImg.data[i + 3] = this.data[i + 3];
        }
        // console.log(rgbImg);
        return rgbImg;
    }

    /**
     * drawbox，在图像上画一个指定大小的矩形
     * @param {number} [x = 50] - 矩形左上角的x坐标，默认为50。
     * @param {number} [y = 50] - 矩形左上角的y坐标，默认为50。
     * @param {number} [w = 50] - 矩形的宽度，默认为50。
     * @param {number} [h = 50] - 矩形的高度，默认为50。
     * @param {string} [color = '#000000'] - 矩形的颜色，默认为'#000000'。
     * @param {number} [linewidth = 2] - 矩形的线宽，默认为2。
    * @param {boolean} [fill = false] - 是否填充矩
    * @param {string} [fillcolor = '#000000'] - 填充的颜色，默认为'#000000'。
    * @returns {Img} - 生成的图像对象。
    */
    drawbox(x = 50, y = 50, w = 50, h = 50, color = '#000000', linewidth = 2, fill = false, fillcolor = '#000000') {
        //在图像上画一个指定大小的矩形
        if (!this.iscasnew) this.update();
        // 设置线宽和颜色
        this.ctx.lineWidth = linewidth;
        this.ctx.strokeStyle = color;

        // 绘制矩形框
        if (fill) {
            this.ctx.fillStyle = fillcolor;
            this.ctx.fillRect(x, y, w, h);
        } else {
            this.ctx.strokeRect(x, y, w, h);
        }
        // 将绘制后的图像数据更新到Img对象中
        //this.data = self.ctx.getImageData(0, 0, this.width, this.height).data;
        this.iscasnew = true;
        return this;
    }

    /**
     * drawtext，在图像上绘制文字
     * @param {number} [x = 50] - 文字的x坐标，默认为50。
     * @param {number} [y = 50] - 文字的y坐标，默认为50。
     * @param {string} [text = 'Hello'] - 要绘制的文字，默认为'Hello'。
     * @param {string} [color = 'red'] - 文字的颜色，默认为'red'。
     * @param {number} [linewidth = 2] - 文字的线宽，默认为2。
    * @param {number} [fontSize = 20] - 文字的字体大小，默认为20。
    * @returns {Img} - 生成的图像对象。
    */
    drawtext({ x = 50, y = 50, text = 'Hello', color = 'red', linewidth = 2, fontSize = 20 } = {}) {
        //在图像上绘制文字
        // 设置文字属性，包括字体大小
        if (!this.iscasnew) this.update();
        this.ctx.font = `${fontSize}px Arial`; // 设置字体大小和样式
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = linewidth;
        // 写入文字
        this.ctx.fillText(text, x, y);
        // 将绘制后的图像数据更新到Img对象中
        //this.data = self.ctx.getImageData(0, 0, this.width, this.height).data;
        this.iscasnew = true;
        return this;
    }

    /**
     * show，向网页中插入图像
     * @param {HTMLCanvasElement} [cas = null] - 要插入的canvas元素，默认为null。
     * @returns {Img} - 生成的图像对象。
    */
    show(cas = null) {
        //向网页中插入图像
        let cs = cas ? cas : document.createElement('canvas');
        cs.width = this.width;
        cs.height = this.height;
        if (this.iscasnew) this.update();
        this.tocanvas(cs);
        cas ? null : document.body.appendChild(cs);
        return this;
    }
}

/**
 * @class DICM，a simple DICOM format parser
 * 一个简单的DICM格式解析器，读取的数组可转为ImgArray数组
 * 参考资料：
 * https://www.cnblogs.com/assassinx/archive/2013/01/09/dicomViewer.html
 * https://www.cnblogs.com/sean-zeng/p/18061402
 * dicom 文件可分为5个部分：
 * 1. 前128个字节为导言区，全都是0；
 * 2. 128-132字节，共4个字节为“DICM”字符串，用于识别检测DICM格式。
 * 3. 文件元数据区， 从132字节开始，使用显示的VR格式记录， 格式有两种形式：
 * 当VR值为OB OW OF UT SQ UN这几种时，格式为：组号（2），元素号（2），vr(2),预留（2），值长度（4），值 ；
 * 当VR值为其他类型时，格式为：组号（2），元素号（2），vr(2),值长度（4），值；
 * 4. 数据元数据区，可以使用显示VR或隐式VR，VR为显式时，数据元数据区为：
 * VR为隐匿时，数据元数据区为：
 * 组号（2），元素号（2），值长度（4），值；
 * 不包含VR项，VR项需要根据组号和元素号确定；
 * 5. 数据区域
 */
class DICM {

    /**
     * 构造函数
     * @param {ArrayBuffer} bf - 二进制数据
     */
    constructor(bf) {
        this.bf = bf;
        this.bytearr = new Uint8Array(bf)
        //识别DICM格式
        this.offset = this.#checkformat(); //the offset should be 132

        //3.解析文件元数据
        [this.islitteendian, this.isexplicitvr] = [true, true];
        this.filemeta = this.#parseheadmeta();
        //4.解析数据元数据
        this.datameta = this.#parsedatameta();
    }

    /**
     * checkformat，检查DICM格式
     * @returns {number} - 检测到DICM格式的偏移量。
     */
    #checkformat() {
        //1. 前128个字节为导言区，全都是0；需要跳过
        //2. 128-132字节，共4个字节为“DICM”字符串，用于识别检测DICM格式。
        let offset = 128;
        let formatstr = String.fromCharCode(...this.bytearr.slice(offset, offset += 4))
        if (formatstr != 'DICM') throw ("it's not dicm image");
        return offset;
    }

    /**
     * getheaderonetag，获取 DICOM 文件的元数据头部信息。
     * 该方法解析文件中的特定位置并提取出元数据区域的相关内容。
     * 
     * 元数据区域包含了多种信息，其中包括：
     * - 组号和元素号（2 字节）
     * - VR（值表示数据类型，2 字节）
     * - 值长度（4 字节或 2 字节，取决于 VR 类型）
     * - 数据值（根据 VR 和长度变化）
     * @param {boolean} [islitteendian=true] - 是否采用小端字节序，默认为 `true`，如果使用大端字节序，则传入 `false`。
     * @returns {Object} 返回一个包含以下属性的对象：
     * - {string} attrcode - 由组号和元素号组成的字符串，格式为 "组号,元素号"。
     * - {string} vr - VR 字段的值，表示数据的类型。
     * - {number} datalength - 数据部分的长度（以字节为单位）。
     * - {Uint8Array} data - 解析出的原始数据值。
     * - {any} value - 根据 VR 解析后的值。
     */
    #getheaderonetag(islitteendian = true) {
        //3. 文件元数据区， 从132字节开始，使用显示的VR格式记录， 格式有两种形式：
        let offset = this.offset
        let arr = this.bytearr;
        //当VR值为OB OW OF UT SQ UN这几种时，格式为：组号（2），元素号（2），vr(2),预留（2），值长度（4），值 ；
        //当VR值为其他类型时，格式为：组号（2），元素号（2），vr(2),值长度（2），值；

        let attrcode = arr.slice(offset, offset += 4);
        attrcode = Array.from(attrcode).map(byte => byte.toString(16).padStart(2, '0'));
        attrcode = attrcode[1] + attrcode[0] + "," + attrcode[3] + attrcode[2];

        let vr = String.fromCharCode(...arr.slice(offset, offset += 2));
        let datalength = 0;
        if (['OB', 'OW', 'OF', 'UT', 'SQ', 'UN'].includes(vr)) {
            offset += 2;
            datalength = new DataView(arr.buffer.slice(offset, offset += 4)).getUint32(0, islitteendian);
        }
        else {
            datalength = new DataView(arr.buffer.slice(offset, offset += 2)).getUint16(0, islitteendian);
        }
        let data = arr.slice(offset, offset += datalength);
        let value = this.vrparse(vr, data, islitteendian);
        this.offset = offset;
        return { attrcode, vr, datalength, data, value }
    }

    /**
     * parseheadmeta
     * @returns {Map} - 文件元数据。
     * 
     */
    #parseheadmeta() {
        //    3. 文件元数据区， 从132字节开始，使用显示的VR格式记录， 格式有两种形式：
        let firsthead = this.#getheaderonetag();
        let headendpos = 0;
        //第一个数据块给出整个文件元数据区的长度，不包含该firsthead的长度
        if (firsthead.attrcode == '0002,0000')   //其值记录了整个文件元数据的长度)
        {
            headendpos = this.offset + firsthead.value;
        }
        else throw new Error('file head error');
        let headmeta = new Map([[firsthead.attrcode, firsthead]]);
        while (this.offset < headendpos) {
            let metadata = this.#getheaderonetag();
            if (metadata.attrcode == '0002,0010') {
                [this.islitteendian, this.isexplicitvr] = this.#getdatametamode(metadata.attrcode, metadata.value);
            }
            headmeta.set(metadata.attrcode, metadata);
        }
        return headmeta;
    }

    /**
     * getdatametamode
     * @param {string} attrcode - 元数据项的属性代码。
     * @param {Uint8Array} value - 元数据项的值。
     * @returns {Array} - 返回一个包含两个元素的数组
     *  - 第一个元素表示是否采用小端字节序，第二个元素表示是否采用显式VR格式。
     */
    #getdatametamode(attrcode, value) {
        //获取数据元数据的模式，有两种显示的或隐式的，以及数值的大小端
        if (attrcode != "0002,0010") {
            return [null, null];
        }
        let isLitteEndian = null;
        let isExplicitVR = null;
        switch (value) {
            case "1.2.840.10008.1.2.1\x00"://显示little
                isLitteEndian = true;
                isExplicitVR = true;
                break;
            case "1.2.840.10008.1.2.2\x00"://显示big
                isLitteEndian = false;
                isExplicitVR = true;
                break;
            case "1.2.840.10008.1.2\x00"://隐式little
                isLitteEndian = true;
                isExplicitVR = false;
                break;
            default:
                break;
        }
        return [isLitteEndian, isExplicitVR]
    }


    /**
     * parsedatameta，解析数据元数据。
     * 该方法解析文件中的数据元数据区域，并提取出其中的元数据信息。
     * @returns {Map} 返回一个包含数据元数据信息的 Map 对象。
     */
    #parsedatameta() {
        let datameta = new Map();
        while (this.offset < this.bytearr.length) {
            let metadata = null;
            if (this.isexplicitvr) {
                metadata = this.#getheaderonetag(this.islitteendian);
            }
            else {
                metadata = this.#getoneimplicitmetadata(this.islitteendian);
            }
            datameta.set(metadata.attrcode, metadata);
        }
        return datameta;
    }

    /**
     * getoneimplicitmetadata，解析隐式数据元数据。
     * 该方法解析文件中的隐式数据元数据区域，并提取出其中的元数据信息。
     * @returns {Object} 返回一个包含数据元数据信息的对象。
     *  - {string} attrcode - 元数据项的属性代码。
     *  - {string} vr - 元数据项的VR。
     *  - {number} datalength - 元数据项的值的长度。
     *  - {Uint8Array} data - 元数据项的值。
     *  - {any} value - 根据VR解析后的值。
     */
    #getoneimplicitmetadata() {
        let arr = this.bytearr;
        let offset = this.offset;
        let attrcode = arr.slice(offset, offset += 4);
        attrcode = Array.from(attrcode).map(byte => byte.toString(16).padStart(2, '0'));
        attrcode = attrcode[1] + attrcode[0] + "," + attrcode[3] + attrcode[2];
        let vr = 'UI';
        let datalength = new DataView(arr.buffer.slice(offset, offset += 4)).getInt32(0, true);
        let data = arr.slice(offset, offset += datalength);
        vr = this.attricodetovr(attrcode);
        let value = this.vrparse(vr, data, this.islitteendian);
        this.offset = offset;
        return { attrcode, vr, datalength, data, value }
    }


    /**
     * fromurl，从URL中加载DICM文件。
     * @static
     * @param {string} url - 文件的URL地址。
     * @returns {Promise<DICM>} - 返回一个 Promise，resolve 时返回一个 DICM 对象。
     */
    static async fromurl(url) {
        let bf = await (await fetch(url)).arrayBuffer();
        return new DICM(bf);
    }


    /**
     * vrparse，解析VR。
     * @param {string} vr - VR 的字符串表示。
     * @param {Uint8Array} arr - 要解析的数组。
     * @param {boolean} islitteendian - 是否采用小端字节序。
     * @returns {string | number } - 解析后的值。
     */
    vrparse(vr, arr, islitteendian) {
        switch (vr) {
            case 'CS':
            case 'SH': //short string 
            case 'LO':
            case 'ST':
            case 'LT':
            case 'UT':
            case 'AE': //application entity
            case 'PN': //person name 
            case 'UI': //Unique Identifier
            case 'DA':
            case 'TM':
            case 'DT':
            case 'AS':
            case 'IS':
            case 'DS':
            case 'OW':
            case 'OF':
                return new TextDecoder().decode(arr);
            case 'UL': //unsigned long
                return new DataView(arr.buffer).getUint32(0, islitteendian);
            case 'SS': //signed short 
                return new DataView(arr.buffer).getInt16(0, islitteendian);
            case 'US': //unsigned short
            case 'AT': //attribute tag
                return new DataView(arr.buffer).getUint16(0, islitteendian);
            case 'SL': //signed long
                return new DataView(arr.buffer).getInt32(0, islitteendian);
            case 'FL': //float
                return new DataView(arr.buffer).getFloat32(0, islitteendian);
            case 'FD': //double
                return new DataView(arr.buffer).getFloat64(0, islitteendian);
            case 'OB':
            case 'UN':
                break;
        }
        return 'unknow';
    }

    /**
     * attricodetovr，将属性代码转换为VR。
     * @param {string} attrcode - 属性代码。
     * @returns {string} - 对应的VR。
     */

    attricodetovr(attrcode) {
        switch (attrcode) {
            case "0002,0000"://文件元信息长度
                return "UL";
            case "0002,0010"://传输语法
                return "UI";
            case "0002,0013"://文件生成程序的标题
                return "SH";
            case "0008,0005"://文本编码
                return "CS";
            case "0008,0008":
                return "CS";
            case "0008,1032"://成像时间
                return "SQ";
            case "0008,1111":
                return "SQ";
            case "0008,0020"://检查日期
                return "DA";
            case "0008,0060"://成像仪器
                return "CS";
            case "0008,0070"://成像仪厂商
                return "LO";
            case "0008,0080":
                return "LO";
            case "0010,0010"://病人姓名
                return "PN";
            case "0010,0020"://病人id
                return "LO";
            case "0010,0030"://病人生日
                return "DA";
            case "0018,0060"://电压
                return "DS";
            case "0018,1030"://协议名
                return "LO";
            case "0018,1151":
                return "IS";
            case "0020,0010"://检查ID
                return "SH";
            case "0020,0011"://序列
                return "IS";
            case "0020,0012"://成像编号
                return "IS";
            case "0020,0013"://影像编号
                return "IS";
            case "0028,0002"://像素采样1为灰度3为彩色
                return "US";
            case "0028,0004"://图像模式MONOCHROME2为灰度
                return "CS";
            case "0028,0010"://row高
                return "US";
            case "0028,0011"://col宽
                return "US";
            case "0028,0100"://单个采样数据长度
                return "US";
            case "0028,0101"://实际长度
                return "US";
            case "0028,0102"://采样最大值
                return "US";
            case "0028,1050"://窗位
                return "DS";
            case "0028,1051"://窗宽
                return "DS";
            //https://dicom.innolitics.com/ciods/ct-image/clinical-trial-subject
            //https://blog.csdn.net/m0_37477175/article/details/103803321
            case "0028,1052": //Rescale Intercept
                return "DS";
            case "0028,1053": //Rescale Slope
                return "DS";
            case "0040,0008"://文件夹标签
                return "SQ";
            case "0040,0260"://文件夹标签
                return "SQ";
            case "0040,0275"://文件夹标签
                return "SQ";
            case '7fe0,0000': //像素长度
                return "UL";
            case "7fe0,0010"://像素数据开始处
                return "OB";
            default:
                return "UI";
        }
    }

    /**
     * getdata，获取图像数据。
     * @returns {Object} - 包含图像数据信息的对象。
     *  - height {number} - 图像高度。
     *  - width {number} - 图像宽度。
     *  - channel {number} - 图像通道数。
     *  - array {Array} - 图像数据数组。
     */
    getdata() {
        let b = this.datameta.get("0028,1052").value; //Rescale Intercept
        let a = this.datameta.get("0028,1053").value;//Rescale Slope
        let v = new Int16Array(this.datameta.get("7fe0,0010").data.buffer);
        a = parseInt(a);
        b = parseInt(b);
        v = v.map(x => x * a + b); //change to HU;
        let height = this.datameta.get("0028,0010").value; //image height;
        let width = this.datameta.get("0028,0011").value;
        return { height, width, channel: 1, array: v, unit: 'HU' }
    }
    /**
     * toImgArray，将图像数据转换为ImgArray对象。
     * @returns {ImgArray} - 包含图像数据的ImgArray对象。
     */
    toImgArray() {
        let v = this.getdata();
        return ImgArray.fromArray(v.array, v);
    }
}



/**
 * delay，创建一个异步的延时函数。
 * @param {number} n - 延时的毫秒数。
 * @returns {Promise} - 返回一个Promise对象，在指定时间后解析。
 */
function delay(n) {
    //异步的延时单位是ms
    return new Promise(function (resolve) {
        setTimeout(resolve, n);
    });
}

//当将该文件用于ES6 Module时，取消以下注释，导出Img, ImgArray 和DICM类
//export {Img, ImgArray,DICM} ;