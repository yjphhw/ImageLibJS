//ImageLibJS用于在WEB上进行图像及图像处理的处理
//
class ImgArray {
    //ImageArray 更重要的是数组，提供数组的计算，但是数组的运算支持上偏向于图像处理
    //后期可以仿照Numpy转为强大的数组计算库
    //支持多种数据类型初始化，但仅对float32进行了验证，其他类型未验证
    //注意文档：https://zhuanlan.zhihu.com/p/153332773

    /**
     * dtypes 是一个静态变量，对于存储数组数据的类型与JS TypedArray的映射关系
     */
    static dtypes={
        float32:Float32Array,
        uint8:Uint8Array,
        uint16:Uint16Array,
        int32:Int32Array,
        uint32:Uint32Array,
        cuint8:Uint8ClampedArray,
    };
    
    /**
     * 
     * @returns 所有支持的数据类型
     */
    static get dtypenames(){
        return Object.keys(this.dtypes);
    }

    /**
     * constructor() 数组初始化函数，采用对象的方式进行初始化，提供了默认值
     * 只实现了三维数组，各维度类比于图像的高，宽和通道，即height，width，channel
     * @param {Int} height，表示数组（图像）的高度，默认值是256
     * @param {Int} width， 表示数组（图像）的宽度，默认值是256
     * @param {Int} channel ，表示数组（图像）的通道数，默认值是3
     * @param {Int} lazy，默认值为false，表示进行初始化
     * @param {String} dtype, 默认为'float32'，可选的值为dtypes中的值
     * @return  
     */
    constructor({height=256, width=256,channel=3,lazy=false,dtype='float32'}={}) {
        this.height = height;
        this.width = width;
        this.channel=channel;
        this.numel=height*width*channel;  //元素数量
        this.dtype=dtype
        this.data=null;
        if (lazy==false){
            this.initarray()
        }
    }

    /**
     * initarray() 根据数组的基本信息，为数组分配存储空间
     * 当数组初始化时lazy=false时调用，分配空间，分配后空间的值为0
     * 也可以利用其副作用重新分配空间
     */
    initarray(){
        if (this.data==null) {
            this.data=new ImgArray.dtypes[this.dtype](this.numel);
        }
        return this;
    }

    /**
     * shape，用属性的方式获取数组的形状，包括高，宽，通道
     */
    get shape(){
        //返回数组的形状
        return {height:this.height,width:this.width,channel:this.channel};
    }

    /**
     * size，用属性的方式获取数组元素的个数
     */
    get size(){
        //返回数组的元素个数
        return this.numel;
    }

    /**
     * elbytes，用属性的方式获取数组元素占用的字节数
     */
    get elbytes(){ 
        //每个元素的字节数
        return ImgArray.dtypes[this.dtype].BYTES_PER_ELEMENT;
    }

    /**
     * bytesize，用属性的方式获取数组占用的字节数
     */
    get bytesize(){
        //返回数组的字节大小
        return this.numel*this.elbytes;
    }

    /**
     * elidxtoidx(elidx=0)，将元素的索引转为数组的三个索引值[h,w,c]
     * 该函数是一个内部函数，一般由其他方法调用，不对外使用
     * @param {Int} elidx，默认值为0，表示获取第一个元素，即[0,0,0]
     * @return {[Int, Int, Int]} 为一个长度为三的数组，
     */
    elidxtoidx(elidx=0){
        if (elidx<0 || elidx>this.numel-1) return ;
        let hwidth=this.width*this.channel;
        let hidx=parseInt(elidx/hwidth);
        elidx=elidx%hwidth;
        let widx=parseInt(elidx/this.channel);
        let cidx=elidx%this.channel;
        return [hidx,widx,cidx];
    }

    /**
     * idxtoelidx(hidx,widx,cidx)，将数组的三个索引值[h,w,c]，转为元素索引elidx
     * 该函数是一个内部函数，一般由其他方法调用，不对外使用
     * @param {Int} hidx，数组元素的高索引，也就是第0维度的索引
     * @param {Int} widx，数组元素的宽索引，也就是第1维度的索引
     * @param {Int} cidx，数组元素的通道索引，也就是第2维度的索引
     * @return {Int} 元素在数组内的真实索引值
     */
    idxtoelidx(hidx,widx,cidx){
        //从数组索引转为元素索引
        return (hidx*this.width+widx)*this.channel+cidx;
    }

    /**
     * checkisvalid(hidx,widx,cidx)，检查索引值是否合法，即是否在数组范围内
     * 目前只支持正索引
     * @param {Int} hidx，数组元素的高索引，也就是第0维度的索引
     * @param {Int} widx，数组元素的宽索引，也就是第1维度的索引
     * @param {Int} cidx，数组元素的通道索引，也就是第2维度的索引
     * @return {Bool} 元素在数组内的真实索引值
     */
    checkisvalid(hidx,widx,cidx){
        if (hidx+1>this.height  || hidx<0 ) return false;
        if (widx+1>this.width   || widx<0)  return false;
        if (cidx+1>this.channel || cidx<0)  return false;
        return true;
    }

    /**
     * getel(hidx,widx,cidx)，根据数组索引获取元素值
     * @param {Int} hidx 
     * @param {Int} widx 
     * @param {Int} cidx 
     * @returns {Number} 元素值
     */
    getel(hidx,widx,cidx){
        //由数组索引获取元素值
        // TODO: 当数组为lazy 时，需要判断是否初始化，要处理未初始化的情况
        if (this.checkisvalid(hidx,widx,cidx)){
            return this.data.at(this.idxtoelidx(hidx,widx,cidx));
        }
        console.error('数组元素索引越界');
        return null;
    }

    /**
     * setel(hidx,widx,cidx,value)，根据索引设置指定元素的值
     * @param {Int} hidx 
     * @param {Int} widx 
     * @param {Int} cidx 
     * @param {Number} value
     * @returns {this} 该数组对象本身
     */
    setel(hidx,widx,cidx,value){
        this.initarray();
        if (this.checkisvalid(hidx,widx,cidx)){
            this.data[this.idxtoelidx(hidx,widx,cidx)]=value;
            return this;  //以供链式调用
        }
        console.error('数组元素索引越界')
        return null;
    }
    
    /**
     * fill(value,cidx)，填充数组的值
     * @param {Int,Int,Array,Int} value 
     * @param {null,Int,Array,Array} cidx 
     * @returns {this} 该数组对象本身
     */
    fill(value=3,cidx=null){
        //数组常值填充，指定某一个通道的数据进行填充
        //fill(255)填充所有元素值为255；
        //fill(255,1)只对1通道填充为255；
        //fill(255,[0,1])对0，1通道填充均填充为255
        //fill([255,120],[0,2])对0通道填充255，对2道填充120
        this.initarray();
        if (cidx==null) {
            this.data.fill(value);
            return this;
        }
        if (cidx instanceof Array){
            if (value instanceof Array){
                if (value.length==cidx.length){
                    let map={};
                    cidx.forEach( (x,idx)=>{ map[x]=value[idx]; });
                    this.data.forEach( (x,idx,arr)=>{  
                        let ci=idx %this.channel; 
                        if (map[ci]) arr[idx]=map[ci];
                        }, this);
                }
                else{
                console.error("value数组长度与cidx数组长度不一致");
                }
            }
            else
            {
                this.data.forEach( (x,idx,arr)=>{ if (cidx.includes(idx %this.channel) ) arr[idx]=value; }, this);
            }
        }
        else {
            this.data.forEach( (x,idx,arr)=>{ if (idx %this.channel==cidx ) arr[idx]=value; }, this);
        }
        return this;
    }   

    /**
     * issameshape(bimgarr)，两数组形状是否相同
     * @param {ImgArray} bimgarr 
     * @returns {Boolean} 
     */
    issameshape(bimgarr){
        //判断两数组形状是否相同
        return  this.height===bimgarr.height &&
                this.width===bimgarr.width &&
                this.channel===bimgarr.channel;
    }

    /**
     * issamehw(bimgarr)，两数组宽高是否相同
     * @param {ImgArray} bimgarr 
     * @returns {Boolean} 
     */
    issamehw(bimgarr){
        //判断两数组的宽高是否相同
        return this.height===bimgarr.height && this.width===bimgarr.width;
    }

    /**
     * issamech(bimgarr)，判断两数组的通道是否相同
     * @param {ImgArray} bimgarr 
     * @returns {Boolean} 
     */
    issamech(bimgarr){
        //判断两数组的通道是否相同
        return this.channel===bimgarr.channel 
    }

    /**
     * dstack(...imgars)，将多个数组沿通道堆叠，数组的宽高必须要相同
     * @param {ImgArray or ImgArray, ImgArray ...} 一个或多个数组 
     * @returns {ImgArray} 
     */
    dstack(...imgars){
        //imgars里为ImgArray实例，应当要具备相同的尺寸
        //将该数组与另外多个高宽一致的数组堆叠为一个新数组
        let tmpimgarrs=[this,...imgars];
        let channelnum=0;
        let channelmapping=[];
        for (let imgidx=0;imgidx<tmpimgarrs.length;imgidx++){
            if (!this.issamehw(tmpimgarrs[imgidx])){
                console.error(`错误：第${imgidx}个堆叠数组的宽高尺寸不一致`);
                return ;
            }
            let tmpchannel=tmpimgarrs[imgidx].channel;
            channelnum+=tmpchannel;
            for (let cidx=0; cidx<tmpchannel;cidx++){
                channelmapping.push([imgidx,cidx]);
            }
        }
        let newimgarr=new ImgArray({height:this.height,width:this.width,channel:channelnum})
        
        for (let hidx=0;hidx<newimgarr.height;hidx++){
            for (let widx=0;widx<newimgarr.width;widx++){
                for (let cidx=0;cidx<newimgarr.channel;cidx++){
                    let [imgidx,ocidx]=channelmapping[cidx];
                    let tmpv =tmpimgarrs[imgidx].getel(hidx,widx,ocidx);
                    newimgarr.setel(hidx,widx,cidx,tmpv)
                }
            }
        }
        return newimgarr;
    }
    
    /**
     * dsplit(...channels)，提取数组的某些通道
     * @param  {...Int} channels 
     * @returns {Array of ImgArray} [ImgArray, ImgArray, ...]
     */
    dsplit(...channels){
        //将数组沿通道进行分割
        //可获取指定通道的数据
        //dsplit(0,2),获取第0和2通道，返回是一个ImgArray的数组
        let arr=[];
        if (channels.length==0) channels= [...new Array(this.channel).keys()]
        for (let i  of channels){
            let tmp=new ImgArray({height:this.height,width:this.width,channel:1});
            for (let hidx=0;hidx<this.height;hidx++){
                for (let widx=0;widx<this.width;widx++){
                    let value=this.getel(hidx,widx,i);
                    tmp.setel(hidx,widx,0,value);
                }
            }
            arr.push(tmp);
        }
        return arr;
    }

    /**
     * hstack(...imgars)，水平堆叠数组
     * @param  {...ImgArray} imgars 
     * @returns {ImgArray} 水平堆叠后的结果
     */
    hstack(...imgars){
        //沿宽度方向叠加
        //需要数组的高和通道数一置，但是该函数不进行检测，由用户来保证
        let tmpimgarrs=[this,...imgars];
        let newwidth=0;
        let widths=[];
        for (let imgidx=0;imgidx<tmpimgarrs.length;imgidx++){
            let tmpwidth=tmpimgarrs[imgidx].width;
            newwidth+=tmpwidth;
            widths.push(newwidth);
        }
        let newimgarr=new ImgArray({height:this.height,width:newwidth,channel:this.channel})

        for (let hidx=0;hidx<newimgarr.height;hidx++){
            for (let widx=0;widx<newimgarr.width;widx++){
                let imgidx=widths.map(x=> widx<x ).indexOf(true);
                let owidx=imgidx>0? widx-widths[imgidx-1] : widx;
                for (let cidx=0;cidx<newimgarr.channel;cidx++){
                    newimgarr.setel(hidx,widx,cidx,tmpimgarrs[imgidx].getel(hidx,owidx,cidx));
                }
            }
        }
        return newimgarr;
    }

    /**
     * vstack(...imgars)，垂直堆叠数组
     * @param  {...ImgArray} imgars 
     * @returns {ImgArray} 垂直堆叠后的结果
     */
    vstack(...imgars){
        //沿高度方向叠加
        //需要数组的宽和通道数一置，但是该函数不进行检测，由用户来保证
        let tmpimgarrs=[this,...imgars];
        let newheight=0;
        for (let imgidx=0;imgidx<tmpimgarrs.length;imgidx++){
            newheight+=tmpimgarrs[imgidx].height;
        }
        let newarray=new ImgArray({height:newheight,width:this.width,channel:this.channel});
        let offsetidx=0;
        for (let imgidx=0;imgidx<tmpimgarrs.length;imgidx++){
            newarray.data.set(tmpimgarrs[imgidx].data, offsetidx);
            offsetidx+=tmpimgarrs[imgidx].numel;
        }
        return newarray;
    }
    
    
    /**
     * filiplr(),在宽度轴上，进行左右翻转
     * @returns {ImgArray}
     */
    fliplr(){
        let outarr=this.empty(false);
        for (let hidx=0;hidx<this.height;hidx++){
            for (let widx=0;widx<this.width;widx++){
                for (let cidx=0;cidx<this.channel;cidx++){
                    let tmpv=this.getel(hidx,widx,cidx);
                    outarr.setel(hidx,this.width-widx-1,cidx,tmpv);
                }
            }
        }
        return outarr
    }
    
    /**
     * flipud(), 在高度轴上，进行上下翻转
     * @returns {ImgArray}
    */
    flipud(){
        let outarr=this.empty(false);
        for (let hidx=0;hidx<this.height;hidx++){
            for (let widx=0;widx<this.width;widx++){
                for (let cidx=0;cidx<this.channel;cidx++){
                    let tmpv=this.getel(hidx,widx,cidx);
                    outarr.setel(this.height-hidx-1,widx,cidx,tmpv)
                }
            }
        }
        return outarr
    }

    /**
     * rollud(dy=100)，上下滚动
     * @param {Int} dy 滚动距离，默认为100
     * @returns {ImgArray} 滚动后的结果
     */
    rollud(dy=100){
        dy=-Math.sign(dy)*(Math.abs(dy)%this.height);
        let newarr=this.empty(false);
        for (let hidx=0;hidx<this.height;hidx++){
            for (let widx=0;widx<this.width;widx++){
                for (let cidx=0;cidx<this.channel;cidx++){
                    let tmpv=this.getel(hidx,widx,cidx);
                    newarr.setel((hidx+dy+this.height)%this.height,widx,cidx,tmpv)
                }
            }
        }
        return newarr;
    }

    /**
     * rolllr(dx=100)，左右滚动
     * @param {Int} dx 滚动距离，默认为100
     * @returns {ImgArray} 滚动后的结果
     */
    rolllr(dx=100){
        dx=Math.sign(dx)*(Math.abs(dx)%this.width);
        let newarr=this.empty(false);
        for (let hidx=0;hidx<this.height;hidx++){
            for (let widx=0;widx<this.width;widx++){
                for (let cidx=0;cidx<this.channel;cidx++){
                    let tmpv=this.getel(hidx,widx,cidx);
                    newarr.setel(hidx,(widx+dx+this.width)%this.width,cidx,tmpv)
                }
            }
        }
        return newarr;
    }

    /**
     * rotate(degree=90)，旋转
     * @param {Int} degree 旋转角度，默认为90
     * @returns {ImgArray} 旋转后的结果
     */
    rotate(degree=90){
        degree=degree%360;
        let rad=degree*Math.PI/180;
        let newarr=this.empty(false);
        let cx=(this.width-1)/2;
        let cy=(this.height-1)/2;
        let cos=Math.cos(rad);
        let sin=Math.sin(rad);
        let dx=cx-cx*cos+cy*sin;
        let dy=cy-cx*sin-cy*cos;
        for (let hidx=0;hidx<this.height;hidx++){
            for (let widx=0;widx<this.width;widx++){
                let oldwidx=cos*widx-sin*hidx+dx;
                let oldhidx=sin*widx+cos*hidx+dy;
                if (! this.checkisvalid(oldhidx,oldwidx,0)) continue;
                for (let cidx=0;cidx<this.channel;cidx++){
                    let tmpv=this.getel(oldhidx,oldwidx,cidx);
                    newarr.setel(hidx,widx,cidx,tmpv);
                }
            }
        }
        return newarr        
    }
    
    //数组点运算
    
    /**
     * vectorize(func)，逐元素运算
     * @param {Function} func 函数，形式为(x)=>y
     * @returns {ImgArray} 运算结果
     */
    vectorize(func){
        //逐元素的运算，function的形式参考array.map接受的回调函数的形式
        let newarr=this.empty(true);
        newarr.data=this.data.map(func);
        return newarr;
    }

    //数组间的运算
    
    /**
     * operateArrayOperation(otherArray,func)，数组间运算，运算方式由参数func决定
     * @param {ImgArray} otherArray，与当前数组尺寸相同
     * @param {Function} func，是一个具有两个参数的函数，返回一个值
     * @returns {ImgArray}
     */
    operateArrayOperation(otherArray, func) {
        if ( this.issameshape(otherArray)) {
            let newarr = this.empty(true);
            newarr.data = this.data.map((val, idx) => func(val, otherArray.data[idx]));
            return newarr;
        } else {
            console.error('两数组的尺寸不匹配或类型不匹配。');
            return null;
        }
    }

    /**
     * add(otherArrayOrValue)，数组加法，支持常数加法
     * @param {ImgArray|Number} otherArrayOrValue，与当前数组尺寸相同，或者为一个常数
     * @returns {ImgArray}
     */
    add(otherArrayOrValue) {
        const addFunc = (x, y) => x + y;
        if (typeof otherArrayOrValue === 'number') {
            return this.vectorize(x => addFunc(x, otherArrayOrValue));
        } else if (otherArrayOrValue instanceof ImgArray) {
            return this.operateArrayOperation(otherArrayOrValue, addFunc);
        }else {
            console.error('无效的操作数。');
            return null;
        }
    }

    /**
     * sub(otherArrayOrValue)，数组减法，支持常数或数组
     * @param {ImgArray | Number} otherArrayOrValue 
     * @returns {ImgArray}
     */
    sub(otherArrayOrValue) {
        const subFunc = (x, y) => x - y;
        if (typeof otherArrayOrValue === 'number') {
            return this.vectorize(x => subFunc(x, otherArrayOrValue));
        } else if (otherArrayOrValue instanceof ImgArray) {
            return this.operateArrayOperation(otherArrayOrValue, subFunc);
        }else {
            console.error('无效的操作数。');
            return null;
        }
    }

    /**
     * mul(otherArrayOrValue)，数组乘法，支持常数或数组
     * @param {ImgArray | Number} otherArrayOrValue 
     * @returns {ImgArray}
     */
    mul(otherArrayOrValue) {
        const mulFunc = (x, y) => x * y;
        if (typeof otherArrayOrValue === 'number') {
            return this.vectorize(x => mulFunc(x, otherArrayOrValue));
        } else if (otherArrayOrValue instanceof ImgArray) {
            return this.operateArrayOperation( otherArrayOrValue, mulFunc);
        }else {
            console.error('无效的操作数。');
            return null;
        }
    }

    /**
     * div(otherArrayOrValue)，数组除法，支持常数或数组
     * @param {ImgArray | Number} otherArrayOrValue 
     * @returns {ImgArray}
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
     * clamp(vmin=0,vmax=255)，截断，将小于vmin的元素变成vmin，大于vmax的元素变成vmax
     * @param {Number} vmin 最小值，默认为0
     * @param {Number} vmax 最大值，默认为255
     * @returns {ImgArray} 截断后的结果
     */
    clamp(vmin=0,vmax=255){
        return this.vectorize( x => x<vmin? vmin: (x>vmax? vmax:x) );
    }

    /**
     * abs()，绝对值
     * @returns {ImgArray} 绝对值结果
     */
    abs(){
        return this.vectorize( x => Math.abs(x));
    }

    /**
     * square()，平方
     * @returns {ImgArray} 平方结果
     */
    square(){
        return this.vectorize( x => x*x);
    }

    /**
     * pow(value)，幂运算
     * @param {Number} value 
     * @returns {ImgArray}
     */
    pow(value){
        return this.vectorize( x => Math.pow(x,value) );
    }

    /**
     * relu(value)，ReLU函数，将小于value的元素变成value，大于value的不变
     * @param {Number} value 
     * @returns {ImgArray}
     */
    relu(value=0){
        return this.vectorize( x =>  x< value? value: x );
    }

    /**
     * opposite()，取反，即每个元素取负
     * @returns {ImgArray}
     */
    opposite(){
        return this.vectorize( x => -x);
    }
    
    /**
     * vectorizemath(func=Math.sin, ...params)，对Math中的函数进行运算
     * @returns {ImgArray} 
     */
    vectorizemath(func=Math.sin,...params){
        //可以看成是一个母函数，只要是调用了Math的函数，都可以用这个函数，
        //例如：前面的pow()方法，写成vectorizemath(Math.pow,y)
        //例如：前面的abs()方法，写成vectorizemath(Math.abs)
        return this.vectorize(x => func(x,...params))
    }


    //todo:分成5个函数，分别对应不同的阈值处理方式？
    threshold(threshold=100,method='binary',maxval=255){
        if (method=='binary'){
            //二值化
            return this.vectorize( (x)=>{ return x> threshold? maxval: 0})
        }
        else if (method=='truncate'){
            //截断化
            return this.vectorize( (x)=>{ return x> threshold? threshold: x})
        }
        else if (method=='binary_inv'){
            //二值化（反转）
            return this.vectorize( (x)=>{ return x> threshold? 0: maxval})
        }
        else if (method=='tozero'){
            //归零化
            return this.vectorize( (x)=>{ return x> threshold? x: 0})
        }
        else if(method=='tozero_inv'){
            //归零化（反转） 
            return this.vectorize( (x)=>{ return x> threshold? 0: x})
        }
    }

    span(lower,upper,vmin=0,vmax=255){
        //区间变换
        let func= (x)=>{
            if(x>=upper) return vmax;
            if(x<=lower) return vmin;
            return (x-lower)/(upper-lower)*(vmax-vmin)+vmin;
        }
        return this.vectorize(func);
    }

    globalminmax(){
        //获取整个数组的最小值和最大值
        let minv=this.data[0];
        let maxv=this.data[0];
        this.data.forEach( (x)=>{ 
            if(x<minv) {
                minv=x ; 
                return }
            if (x>maxv) {
                maxv=x ;
                return }
        });
        return {minv,maxv};
    }

    stretch(vmin=0,vmax=255){
        //拉伸到指定的数值范围内
        let {minv,maxv}=this.globalminmax();
        if (minv==maxv){
            return this.copy().fill( (vmin+vmax)/2 ); } 
        else{
            return this.vectorize( (x)=>{return (x-minv)/(maxv-minv)*(vmax-vmin)+vmin});
        }
    }
    
    pad({l=1,r=2,t=3,b=4, fillvalue=0}={}){
        //对高和宽进行常数填充的扩边操作,顺序是左上右下
        let newheight=this.height+t+b;
        let newwidth=this.width+l+r;
        let newarr=new ImgArray({height:newheight,width:newwidth,channel:this.channel}).fill(fillvalue);
        for (let hidx=t;hidx<this.height+t;hidx++){
            for(let widx=l;widx<this.width+l;widx++){
                for (let cidx=0;cidx<this.channel;cidx++){
                    let ohidx=hidx-t;
                    let owidx=widx-l;
                    let tmpv=this.getel(ohidx,owidx,cidx);
                    newarr.setel(hidx,widx,cidx,tmpv);
                }
            }
        }
        return newarr;
    }

    slice(sthidx,edhidx,stwidx,edwidx){
        //参数含义分别别是高的起始和结束位置（不包含结束位置），宽的起始和结束位置（不包含结束位置）
        //返回一个新的ImgArray对象
        if (this.checkisvalid(sthidx,stwidx,0) && this.checkisvalid(edhidx-1,edwidx-1,0)){
            let newheight=edhidx-sthidx;
            let newwidth=edwidx-stwidx;
            let newimgarr=new ImgArray({height:newheight,width:newwidth,channel:this.channel});
            for (let hidx=0;hidx<newheight;hidx++){
                for (let widx=0;widx<newwidth;widx++){
                    for(let cidx=0;cidx<this.channel;cidx++){
                        let tmpv=this.getel(hidx+sthidx,widx+stwidx,cidx);
                        newimgarr.setel(hidx,widx,cidx,tmpv);
                    }
                }
            }
            return newimgarr;
        }
        console.error('数组索引越界。')
    }
    
    structure(pattern=[[1,1,1],[0,1,0],[1,1,1]],fillvalue=0){
        //按照结构元素进行邻域展开
        let kernelheight=pattern.length;
        let kernelwidth=pattern[0].length;
        
        let pady=Math.floor(kernelheight/2);
        let padx=Math.floor(kernelwidth/2);
        
        let padimgar=this.pad({l:padx,t:pady,r:padx,b:pady,fillvalue});
        let imgarrs=[];
        for (let idxh=0; idxh<kernelheight;idxh++){
            for (let idxw=0;idxw<kernelwidth;idxw++){
                if (pattern[idxh][idxw]==0) continue;  
                imgarrs.push(padimgar.slice(idxh,idxh+this.height,idxw,idxw+this.width));
            }
        }
        let [baseimg,...resimgs]=imgarrs;
        return baseimg.dstack(...resimgs);
    }

    neighbor(sizes=[3,3],fillvalue=0){
        //按尺寸进行邻域展开,sizes是2个元素组成的数组，表示邻域的高和宽，里边应当是奇数
        //该方法实际上不操作，只生成pattern，调用strcuture完成邻域的生成
        let pt=[];
        for (let idxh =0;idxh<sizes[0];idxh++){
            pt.push(Array(sizes[1]).fill(1));
        }
        return this.structure(pt,fillvalue);
    }

    apply_along_channel(func){
        //沿通道的运算，func为一回调函数接收一个一维数组，返回一个数值
        let outimgarr=new ImgArray({height:this.height,width:this.width,channel:1});
        for (let idxh=0; idxh<this.height;idxh++){
            for (let idxw=0;idxw<this.width;idxw++){
                let stidx=this.idxtoelidx(idxh,idxw,0);
                let data=this.data.slice(stidx,stidx+this.channel);
                let value=func(data);
                outimgarr.setel(idxh,idxw,0,value);
            }
        }
        return outimgarr;
    }

    mean(ischannel=false){
        //当ischannel为True时，沿通道计算均值，否则计算全局均值
        if (ischannel){
        let func=(x)=>{ return x.reduce((prev, curr) => { return prev + curr })/x.length};
        return this.apply_along_channel(func);
        }
        return this.data.reduce((prev, curr) => { return prev + curr })/this.data.length;
    }

    max(ischannel=false){
        //当ischannel为True时，沿通道计算最大值，否则计算全局最大值
        if (ischannel){  //膨胀，最大值池化
            let func=(x)=>{ return Math.max(...x)}
            return this.apply_along_channel(func);
        }
        let maxv=this.data[0];
        this.data.forEach( (x)=>{ if(x>maxv) maxv=x});
        return maxv;
    }

    min(ischannel=false){
        //当ischannel为True时，沿通道计算最小值，否则计算全局最小值
        if (ischannel){//腐蚀，最小值池化
            let func=(x)=>{ return Math.min(...x)}
            return this.apply_along_channel(func)
        }
        let minv=this.data[0];
        this.data.forEach( (x)=>{ if(x<minv) minv=x});
        return minv;
    }

    linearc(weights=[1,2,3],bais=0){
        //线性加权和
        //判断weights的长度与通道数相同
        let func=(x)=>{ 
            let res=0
            for (let i =0;i<weights.length;i++) {
                res+=x[i]*weights[i]
            } 
            return res+bais
        }
        return this.apply_along_channel(func)
    }

    conv2d(weights=[[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]],bias=0,fillvalue=0){
        //卷积运算，只对通道数为1的数组有效
        //weights卷积
        let size=[weights.length,weights[0].length]
        let nb=this.neighbor(size,fillvalue)
        return nb.linearc(weights.flat(),bias)
    }

    median(sizes=[3,3],fillvalue=0){
        //中值滤波，对通道数为1的数组结果正确
        let tmparr=this.neighbor(sizes,fillvalue)
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

    //高斯滤波
    gaussianBlur(sigma=2,kernel_size=[3,3],fillvalue=0){
        let tmparr=this.neighbor(kernel_size,fillvalue)
        function creategausskernel(sigma,kernel_size){
            let kernel = [];
            let center = Math.floor(kernel_size[0] / 2);
            for (let i = 0; i < kernel_size[0]; i++) {
                let row = [];
                for (let j = 0; j < kernel_size[1]; j++) {
                let x = i - center;
                let y = j - center;
                let value =(1 / (2 * Math.PI * sigma * sigma)) * Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
                row.push(value);
                }
                kernel.push(row);
            }
            // 归一化
            let sum = kernel.reduce((a, b) => a.concat(b)).reduce((a, b) => a + b);
            // console.log(sum);
            for (let i = 0; i < kernel_size[0]; i++) {
                for (let j = 0; j < kernel_size[1]; j++) {
                kernel[i][j] /= sum;
                }
            }
            // console.log(kernel);
            return kernel;
        }
        return tmparr.conv2d(creategausskernel(sigma,kernel_size));
    }

    //边缘检测算子
    sobelx(){
        let kernel = [[-1,0,1],[-2,0,2],[-1,0,1]];
        return this.conv2d(kernel);
    }

    sobely(){
        let kernel = [[-1,-2,-1],[0,0,0],[1,2,1]];
        return this.conv2d(kernel)
    }

    sobelxy(){
        return this.sobelx().abs().add(this.sobely().abs());
    }

    laplacian(size=4){
        let kernel4 = [[0,-1,0],[-1,4,-1],[0,-1,0]];
        let kernel8 = [[-1,-1,-1],[-1,8,-1],[-1,-1,-1]];
        let kernel = size==4?kernel4:kernel8;
        return this.conv2d(kernel)
    }
    
    sharrx(){
        let kernel = [[-3,0,3],[-10,0,10],[-3,0,3]];
        return this.conv2d(kernel);
    }

    sharry(){
        let kernel = [[-3,-10,-3],[0,0,0],[3,10,3]];
        return this.conv2d(kernel);
    }

    sharrxy(){
        return this.sharrx().abs().add(this.sharry().abs());
    }

    prewittx(){
        let kernel = [[-1,0,1],[-1,0,1],[-1,0,1]];
        return this.conv2d(kernel);
    }
    prewitty(){
        let kernel = [[-1,-1,-1],[0,0,0],[1,1,1]];
        return this.conv2d(kernel)
    }
    prewittxy(){
        return this.prewittx().abs().add(this.prewitty().abs());
    }

    //canny算子，有问题
    canny(){
        let tmparr=this.structure([[1,1,1],[1,-7,1],[1,1,1]],0)
        return tmparr.conv2d(creategausskernel(1,3))
    }

    maxpooling(size=[3,3],fillvalue=0){
        //最大值池化
        let tmparr=this.neighbor(size,fillvalue);
        return tmparr.max(true);
    }

    minpooling(size=[3,3],fillvalue=0){
        //最小值池化
        let tmparr=this.neighbor(size,fillvalue);
        return tmparr.min(true);
    }
    
    avgpooling(size=[3,3],fillvalue=0){
        //平均池化（均值滤波）
        let tmparr=this.neighbor(size,fillvalue);
        return tmparr.mean(true);
    }

    dilate(pattern=[[1,1,1],[0,1,0],[1,1,1]],fillvalue=0){
        //膨胀运算
        let tmparr=this.structure(pattern,fillvalue);
        return tmparr.max(true);
    }

    erode(pattern=[[1,1,1],[0,1,0],[1,1,1]],fillvalue=0){
        //腐蚀运算
        let tmparr=this.structure(pattern,fillvalue);
        return tmparr.min(true);
    }

    mgradient(sizes=[3,3],fillvalue=0){
        //形态学梯度
        let tmparr=this.neighbor(sizes,fillvalue);
        return tmparr.max(true).sub( tmparr.min(true));
    }

    open(pattern=[[1,1,1],[0,1,0],[1,1,1]], fillvalue=0){
        // 开运算
        return this.erode(pattern, fillvalue).dilate(pattern, fillvalue);
    }

    close(pattern=[[1,1,1],[0,1,0],[1,1,1]], fillvalue=0){   
        // 闭运算     
        return this.dilate(pattern, fillvalue).erode(pattern, fillvalue);
    }

    tophat(pattern=[[1,1,1],[0,1,0],[1,1,1]], fillvalue=0){
        // 顶帽运算
        return this.sub(this.open(pattern, fillvalue));
    }

    blackhat(pattern=[[1,1,1],[0,1,0],[1,1,1]], fillvalue=0){
        // 黑帽运算
        return this.close(pattern, fillvalue).sub(this);
    }
    
    adaptiveThreshold(sizes=[3,3], fillvalue=0, constant=0){
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

    lbp(){
        //经典的lbp特征
        let tmparr = this.neighbor([3,3],0);
        function calclbp(x){
            let tmpnew=0;
            let weights = [128,64,32,1,0,16,2,4,8];
            for(let i=0;i<9;i++){
                if(x[i]>x[4]){
                    tmpnew+=weights[i];
                }
                }
            return tmpnew;
        }
        return tmparr.apply_along_channel(calclbp);
    }

    lmi(sizes=[3,3]){
        //LMI特征
        let tmparr = this.neighbor(sizes,0);
        let centerpos=Math.floor(tmparr.shape.channel/2);
        function calclmi(x){
            let tmpnew=0;
            let centvalue=x[centerpos];
            for(let i=0;i<x.length;i++){
                if(x[i]<centvalue){
                    tmpnew+=1;
                }
                }
            return tmpnew;
        }
        return tmparr.apply_along_channel(calclmi);
    }
    
    cellsim(sizes=[3,3]){
        //元胞自动机，生命游戏
        // 生命游戏规则：生命游戏是一种著名的二维元胞自动机，其规则非常简单，每个元胞根据其周围八个相邻元胞的状态来改变自己的状态，规则定义如下：
        // 如果一个元胞的状态为死亡（0），且周围有三个元胞的状态为存活（1），则该元胞下一个状态为存活（1）；
        // 如果一个元胞的状态为存活（1），且周围有两个或三个元胞的状态也为存活（1），则该元胞下一个状态仍为存活（1）；
        // 其他情况下，该元胞下一个状态为死亡（0）。
        let tmparr = this.neighbor(sizes,0);
        function calcell(x){
            let tmpnew=0;
            let centerpos=Math.floor(x.length/2);
            for(let i=0;i<x.length;i++){
                if(x[i]>=0.5){
                    tmpnew+=1;
                }
            }
            if(x[centerpos]>=0.5){
                if(tmpnew==4||tmpnew==3)
                    return 1;
                else return 0;
        
            }else{
                if(tmpnew==3)
                    return 1;
                else return 0;
            }
        }
        return tmparr.apply_along_channel(calcell);
    }
    
    copy(){
        //复制当前数组
        let newarr=this.empty(true);
        newarr.data=this.data.slice();
        return newarr;
    }

    empty(lazy=false){
        //创建一个与当前数组尺寸相同的空数组
        //考虑了ImgArray和Img实例
        if (this.constructor.name=="ImgArray"){
            return new ImgArray({height:this.height,
                width:this.width,
                channel:this.channel,
                lazy,
                dtype:this.dtype})
        }
        else {
            return new Img({height:this.height,
                width:this.width,
                lazy})
        }
    }

    static meshgrid(hrange=[0,256],wrange=[0,256]){
        //产生规则格网
        let width=wrange[1]-wrange[0]
        let height=hrange[1]-hrange[0]
        let ximgarr=new ImgArray({height,width,channel:1})
        let yimgarr=new ImgArray({height,width,channel:1})
        for (let hidx=0;hidx<height;hidx++){
            for (let widx=0;widx<width;widx++){
                ximgarr.setel(hidx,widx,0,widx+wrange[0]);
                yimgarr.setel(hidx,widx,0,hidx+hrange[0]);
            }
        }
        return [yimgarr,ximgarr];
    }

    static random({height=256,width=256,channel=3,vmin=0,vmax=255}={}){
        //创建一个指定尺寸的，指定范围的均值分布的数组
        let newimgarr=new ImgArray({height,width,channel,lazy:false});
        newimgarr.data=newimgarr.data.map(x=>Math.random()*(vmax-vmin)+vmin);
        return newimgarr;
    }

    static zeros({height=256,width=256,channel=3}={}){
        return new ImgArray({height,width,channel,lazy:false});
    }

    static ones({height=256,width=256,channel=3}={}){
        return new ImgArray({height,width,channel,lazy:false}).fill(1);
    }

    static full({height=256,width=256,channel=3}={},value=0){
        return new ImgArray({height,width,channel,lazy:false}).fill(value);
    }

    static fromBuffer(arraybuffer, shape, dtype = 'float32') {
        // arraybuffer创建ImgArray,假设buffer的排列方向是hwc，将buffer根据dtype转换为typedarray
        // 参照random函数，检查转换后的和shape个数一致
        let {height, width, channel} = shape;

        let type = ImgArray.dtypes[dtype];
        let bytesize = height * width * channel * type.BYTES_PER_ELEMENT;
        // 确保转换后的数组长度与期望的shape一致
        if (bytesize !== arraybuffer.byteLength) {
            throw new Error('长度不匹配');
        }

        let typedArray = new type(height * width * channel);
        
        // 创建ImgArray实例，并将数据赋值
        let newimgarr = new ImgArray({ height, width, channel, lazy: true });
        // newimgarr.data = typedArray.map(x => x);
        newimgarr.data = typedArray.slice();//创建一个幅本
        return newimgarr;
        }
    
    
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
        let {height, width, channel} = shape;
        if (flatArray.length !== height * width * channel) {
            throw new Error('长度不匹配');
        }
        let newimgarr = new ImgArray({ height, width, channel, lazy: true });
        newimgarr.data = new ImgArray.dtypes[dtype](flatArray);
        return newimgarr;
    }

    dist(v2=[3,4,5]){
        //计算数组在通道方向与一个向量的欧氏距离
        if (v2.length != this.channel) {
                console.error('数组长度与通道数不匹配。');
                return ;
        }
        let func= (v1)=>{
            let res=0
            for (let i=0;i<v2.length;i++){
                res+=(v1[i]-v2[i])*(v1[i]-v2[i]);
            }
            return Math.sqrt(res);
        }
        return this.apply_along_channel(func)
    }

    cossimdist(v2=[3,4,5]){
        //计算数组在通道方向与一个向量的余弦距离
        if (v2.length != this.channel){
                console.error('数组长度与通道数不匹配。');
                return ;
        }
        let l2=Math.hypot(...v2)
        let func= (v1)=>{
            let res=0
            for (let i=0;i<v2.length;i++){
                res+=v1[i]*v2[i]
            }
            return 1-res/(l2*Math.hypot(...v1)+0.0000001)
        }
        
        return this.apply_along_channel(func)
    }

    kmeans(k=4,centers=null,disttype='dist'){
        //k均值聚类
        //k表示聚类数量,
        //centers是一个kxchannel的二维列表构成的数组，表示k个聚类中心，当为null时程序自动随机选择
        //disttype是距离度量方式可以为dist或者是cossimdist,
        //初始化聚类中心
        if (centers===null){
            centers=[] 
            for(let i=0;i<k;i++){
                let tmpx=parseInt(Math.random()*this.width)
                let tmpy=parseInt(Math.random()*this.height)
                let idx=this.idxtoelidx(tmpy,tmpx,0)
                let v2=this.data.slice(idx,idx+this.channel)
                v2=Array.from(v2)
                centers.push(v2)
            }
        }
        else{
            k=centers.length
        }
        //对聚类中心按照特征值排一下序，保证不同的初始情况具有相似的聚类效果
        centers.sort((a,b)=>Math.max(...a)-Math.max(...b))

        //计算像素到各中心的距离
        let dists=[]
        for(let i=0;i<k;i++){
            let tmpdist= disttype=='dist'? this.dist(centers[i]):this.cossimdist(centers[i]) 
            dists.push(tmpdist)
        }
        //计算聚类结果
        let clusternum=Array(k).fill(0)
        let newcenters=Array(k)
        for (let i = 0; i < k; i++) {
            newcenters[i] = new Array(this.channel).fill(0);
        }
        
        let clusterresult=new ImgArray({height:this.height,width:this.width,channel:1,lazy:false,dtype:'cuint8'})
        for (let i=0;i<dists[0].data.length;i++){
            let minv=Infinity;
            let minidx=0;
            for (let idx=0;idx<dists.length;idx++){
                if (dists[idx].data[i]<minv) {  
                    minv=dists[idx].data[i]
                    minidx=idx
                }
            }
            //console.log(minv,minidx)
            clusterresult.data[i]=minidx
            clusternum[minidx]+=1  //类别计数器加1
            let [h,w,c]=dists[0].elidxtoidx(i)
            let idx=this.idxtoelidx(h,w,0)
            let v2=this.data.slice(idx,idx+this.channel)
            for (let idx=0; idx<this.channel;idx++){
                newcenters[minidx][idx]=v2[idx]+newcenters[minidx][idx]
            }
            
        }
                
        //更新聚类中心
        for (let idx=0;idx<centers.length;idx++){
            for(let i=0;i<this.channel;i++){
                newcenters[idx][i]=newcenters[idx][i]/clusternum[idx];
            }
        }
        return [newcenters,clusterresult]
    }

    totensor(dtype='float32'){
        //dtype canbe float32, uint8 currently
        //将数组转为onnxruntime中的张量
        if (typeof ort == 'undefined') console.error('需要加载onnnxruntime.js')
        if (dtype=='float32')
            return new ort.Tensor(dtype,this.data.slice(),this.shape)
        if (dtype=='uint8'){
            let imgardata=new Uint8Array(this.data)
            return new ort.Tensor(dtype,imgardata,this.shape)}
    }

    static fromtensor(tensor){
        //将onnxruntime中的张量转为数组
        let dim=tensor.dims.length;
        let arr=null;
        if (dim==3)
            arr=new ImgArray(t.dims[0],t.dims[1],t.dims[2]);
        else
            arr=new ImgArray(t.dims[0],t.dims[1],1);
        arr.data=new Float32Array(t.data);
        return arr;
    }

    hwc2chw(){
        //用于将hxwxc转为cxhxw的方法，返回一个排列为cxhxw的一维float32数组
        let chs=this.dsplit();
        let res=new ImgArray({height:this.channel,width:this.height,channel:this.width,dtype:this.dtype});
        for (let i =0;i<chs.length;i++){
            res.data.set(chs[i].data, i*chs[i].data.length);
        }
        return res;
    }

    chw2hwc(){
        //hwc2chw的逆操作,hwc2chw和chw2hwc都是transpose的简单化
        let {height,width,channel}=this.shape;
        let [c,h,w]=[height,width,channel];
        let baselen=h*w;
        let res=new ImgArray({height:h,width:w,channel:c,dtype:this.dtype});
        let offsets=[];
        for (let i=0;i<c;i++){
            offsets.push(i*h*w);
        }
        for (let i=0;i<baselen;i++){
            let idx=i*c;
            for(let j=0;j<c;j++ ){
                let oidx=offsets[j]+i;
                res.data[idx+j]=this.data[oidx];
            }
        }
        return res;
    }
    
    astype(dtype='float32'){
        if (! ImgArray.dtypes[dtype]) {
            console.error('不支持的dtype类型');
            return;
        }
        let res=this.empty(true);
        res.data=new ImgArray.dtypes[dtype](this.data);
        res.dtype=dtype;
        return res;
    }
    
    show({vmin=0,vmax=255,cas=null}={}){
        //当数组为图像时，直接在网页中显示图像，方便观察
        //与matploblib的imshow很相似
        if ([1,3,4].includes(this.channel)){
            let data=this.span(vmin,vmax,0,255);
            let img=Img.fromarray(data);
            img.show(cas);
            return img;   //返回显示的图像对象，从而可以调用其方法
        }
        else {
            console.error('array channel is not correct, channel should be 1(gray),3(RGB) or 4(RGBA)')
            console.error('数组的通道数不正确，当通道数是1（灰度）, 3（RGB彩色）, 或 4（带有透明通道的彩色图像）时才可以显示为图像！')
        }
    }
    
    /**
     * toString() 将数组转为字符显示
     * @returns {String} 数组的字符串表示
     */
    toString(){
        //对于大数组的显示存在问题，参照Numpy
        let str=`shape: [${this.height}, ${this.width}, ${this.channel}]\ndtype: ${this.dtype}\ndata :\n[`;
        for(let h=0; h<this.height;h++){
            let block=h? ' [': '[';
            for(let w=0; w<this.width;w++){
                let line=w? '  [': '[';
                for (let c=0; c<this.channel;c++){
                    let v=this.getel(h,w,c);
                    line+=v.toFixed(2)+' ';   
                }
                if (w<this.width-1)
                    block+=line+']\n';
                else
                    block+=line+']';
            }
            if (h<this.height-1)
                str+=block+']\n\n';
            else
                str+=block+']';
        }
        return str+']';
    }
    
    /**
     * 在控制台打印数组
     */
    print(){
        console.log(this.toString())
    }
}

class Img extends ImgArray{
    //Img 继承自ImgArray类，虽然支持ImgArray的所有方法，但是不保证运行正确，
    //更主要的是用于图像的存取和简单变换
    //Img 本身就是图像
    //Img的图像类型只支持RGBA排列一种
    constructor({height=256,width=256,lazy=false}={}) {
        //调用ImgArray完成初始化
        super({height,width,channel:4,lazy,dtype:'cuint8'});
        //创建一个保存图像的canvas
        let cas=document.createElement('canvas');
        this.cas=cas;
        this.cas.height=height;
        this.cas.width=width;
        this.ctx=cas.getContext('2d');
        this.iscasnew=false;  //用于标记图像数据和画布哪个新，要用新的去同步旧的
    }

    update(){
        //根据标志位进行数据和canvas同步
        if (this.iscasnew){
            let imgdata=this.ctx.getImageData(0,0,this.cas.width,this.cas.height);
            this.data=imgdata.data.slice();  
            this.iscasnew=false;
        }
        else{
            let imgdata=new ImageData(this.data,this.width,this.height)
            this.ctx.putImageData(imgdata,0,0)
        }
    }

    static fromarray(imgarray){
        //将数组转为图像
        let img=null;
        let pixelnum=imgarray.data.length/imgarray.channel;
        if (imgarray.channel==1){
            img=new Img({height:imgarray.height,width:imgarray.width});
            for(let i=0;i<pixelnum;i+=1){
                img.data[i*4]=imgarray.data[i];
                img.data[i*4+1]=imgarray.data[i];
                img.data[i*4+2]=imgarray.data[i];
                img.data[i*4+3]=255;//不透明
            }
        }else if(imgarray.channel==3){
            img=new Img({height:imgarray.height,width:imgarray.width});
            for(let i=0;i<pixelnum;i+=1){
                img.data[i*4]=imgarray.data[i*3];
                img.data[i*4+1]=imgarray.data[i*3+1];
                img.data[i*4+2]=imgarray.data[i*3+2];
                img.data[i*4+3]=255;
            }
        }else if(imgarray.channel==4){
            img=new Img({height:imgarray.height,width:imgarray.width});
            img.data.set(imgarray.data);
        }else{
            console.error("不支持的通道数："+imgarray.channel);
        }
        return img;
    }

    static fromcanvas(canvasele){
        //从canvas元素生成图像
        let ctx = canvasele.getContext("2d");
        let imgdata=ctx.getImageData(0,0,canvasele.width,canvasele.height);
        let oimg=new Img({height:imgdata.height,width:imgdata.width,lazy:true});
        oimg.data=imgdata.data.slice();  //.slice() 复制数据
        return oimg
    }

    static fromimg(imgele){
        if (! imgele.width) {
            console.error('no image');
            return null;
        }
        let width=imgele.width 
        let height=imgele.height
        let img=new Img({width,height,lazy:true})
        img.ctx.drawImage(imgele, 0, 0, img.width, img.height);
        img.iscasnew=true;
        img.update()
        return img
    }
    static fromurl(imgurl){
        //从链接生成图像
        //返回是个promise对象，需要使用await
        return new Promise(function (r,e){
            let img=new Image();
            img.src=imgurl;
            img.setAttribute('crossOrigin', '');//解决网络图片跨域的问题
            img.onload=(ex)=>{
                r(Img.fromimg(img));
            }
            img.onerror=(ex)=>{return e(ex)}
        })
    }


    static fromblob(blob){
        //从blob生成图像
        //返回是个promise对象，需要使用await
        //从编码的图像中生成图像，即将blob对象转为Image
        //测试代码：
        //fetch('/a.jpg').then(x=>{ return x.blob()}).then(b=>{return Img.fromblob(b)}).then(img=>{img.tocanvas(cas)})
        let src=URL.createObjectURL(blob)
        return this.fromurl(src)
    }

    static fromfile(fileobj){
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
        return new Promise(function(r,e){
            const reader = new FileReader()
            // console.log(fileobj.type)
            if (!fileobj.type.startsWith('image')) return e('not image')
            reader.readAsDataURL(fileobj) 
            
            reader.onload = ()=>{
                let url=reader.result
                r(Img.fromurl(url))
                }
            }) 
    }

    static fromvideo(videoele,h=null,w=null){
        //从video的视频流中截取图像
        let vcas=document.createElement('canvas');
        vcas.width=w? w : videoele.videoWidth;
        vcas.height=h? h: videoele.videoHeight;
        let context = vcas.getContext('2d');
        context.drawImage(videoele, 0, 0);
        return Img.fromcanvas(vcas);
    }

    static videotocanvas(canvasel) {
        //在canvas element 上显示画布
        let context = canvasel.getContext('2d');
    
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                var video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                video.addEventListener('loadedmetadata', function() {
                    canvasel.width = video.videoWidth;
                    canvasel.height = video.videoHeight;
                });
    
                function drawFrame() {
                    context.drawImage(video, 0, 0);
                    requestAnimationFrame(drawFrame);
                }
                requestAnimationFrame(drawFrame);
            })
            .catch(function(error) {
                console.log('无法获取视频流: ', error);
            });
    }
    
    static fromcamera(h=null,w=null){
        //从摄像头头获取一幅图像
        //返回是个promise对象，需要使用await
        return new Promise(function (r,e){
            try {
                navigator.mediaDevices.getUserMedia({ video: true }).then(stream=>{
    
                    let video = document.createElement('video');
                    video.srcObject = stream;
                    video.play();
                    video.addEventListener('loadeddata',(e)=>{
                        r(Img.fromvideo(video,h,w))
                    }) });

                }
            catch (error) {
                    e('打开相机失败！');
            }
        })
    }


    tofile(name='download'){
        //将图像以指定名称保存，只支持png格式
        const save_link = document.createElement("a");
        save_link.href = this.tourl();
        save_link.download = name+'.png';
        save_link.dataset.downloadurl = ["image/png", save_link.download, save_link.href].join(':');
        save_link.click();
    }

    tourl(){
        //将图像转为url
        if (! this.iscasnew) this.update();
        return this.cas.toDataURL('image/png',1);//图像不会被压缩
    }

    toimg(imgele){
        //将Img转换为img标签元素在网页中展示出来
        let data=this.tourl()
        imgele.src=data
    }
    
    tocanvas(canvasele,isfull=false){
        if ( this.iscasnew) this.update();
        //将Img转换为画布元素在网页中展示出来,需要canvasele的宽高与图像一致
        //需要使canvas适配图像的话将isfull置true
        if (isfull){
            canvasele.width=this.width;
            canvasele.height=this.height;
        }
        let ctx = canvasele.getContext("2d");
        let imgdata=new ImageData(this.data,this.width,this.height)
        ctx.putImageData(imgdata,0,0)
    }

    toarray(droptrans=true){
        //将图像转为数组,droptrans表示通道丢弃，即只保留RGB三个通道的数据
        if ( this.iscasnew) this.update();
        let channel= droptrans? 3:4;
        if (droptrans){
            let oimgar=new ImgArray({height:this.height,width:this.width,channel});
            oimgar.data.forEach((x,idx,arr)=>{ arr[idx]=this.data[parseInt(idx/3)*4+idx%3]},this);
            return oimgar;
        }
        else{
            let oimgar=new ImgArray({height:this.height,width:this.width,channel,lazy:true});
            oimgar.data=new Float32Array(this.data);
            return oimgar;
        }
    }
    
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
            if (c!==3) {
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
     * getpixel(x,y)，获取图像的像素值
     * @param {Int} x , 像素的x坐标，横坐标
     * @param {Int} y , 像素的y坐标，纵坐标
     * @returns {Uint8ClampedArray(4)} rgba，范围为0~255
     */
    getpixel(x,y){
        let idx=this.idxtoelidx(y,x,0);
        return this.data.slice(idx,idx+this.channel);
    }

    /**
     * setpixel(x,y,rgba)，设置图像的像素值
     * @param {Int} x 
     * @param {Int} y 
     * @param {Uint8ClampedArray(4) || Array(4)} rgba ,元素值的范围要为0~255
     */
    setpixel(x,y,rgba=[0,0,0,255]){
        rgba=new Uint8ClampedArray(rgba);
        if (rgba.length>4) 
            rgba=rgba.slice(0,4);
        let idx=this.idxtoelidx(y,x,0);
        this.data.set(rgba,idx);
    }

    //试验性函数
    applycolormap(){
        //常试性的特性，将图像转灰度后，为灰度图像添加warm to cool的通过添加伪彩色warm to cool
        //cool to warm from vtkjs colormaps.json
        //颜色映射的计算来自于vtkjs colormaps.json中的定义
        let colormap=new Map();
        function calc(x){
            x=x/255;
            let r,g,b;
            let wa,wb;
            if (x<0.5){
                wa=(0.5-x)/0.5
                wb=x/0.5
                r=wa*0.705882352941+wb*0.865;
                g=wa*0.0156862745098+wb*0.865;
                b=wa*149019607843+wb*0.865;
            }
            else{
                wa=(1-x)/0.5
                wb=(x-0.5)/0.5
                r=wa*0.865+wb*0.23137254902;
                g=wa*0.865+wb*0.298039215686;
                b=wa*0.865+wb*0.752941176471;
            }
            return [r*255,g*255,b*255]
        }
        for (let i=0;i<256;i++){
            colormap.set(i,calc(i));
        }
        let outimg=this.empty(false);
        for (let y=0;y<this.height;y++){
            for (let x=0;x<this.width;x++){
                let [r,g,b,a]=this.getpixel(x,y);
                [r,g,b]=colormap.get(parseInt((r+g+b)/3));
                outimg.setpixel(x,y,[r,g,b,a]);
            }
        }
        return outimg;
    }

    resize(height=256,width=256){
        if (! this.iscasnew) this.update();
        let canvas = document.createElement('canvas');
        canvas.width=width;
        canvas.height=height;
        let ctx=canvas.getContext('2d');
        ctx.drawImage(this.cas,0,0,this.width,this.height,0,0,width,height)
        return Img.fromcanvas(canvas)
    }

    rotate(deg=45){
        if (! this.iscasnew) this.update();
        let angleInRadians = deg * Math.PI / 180; // 将角度转换为弧度
        let canvas = document.createElement('canvas');
        canvas.width=this.width;
        canvas.height=this.height;
        let ctx=canvas.getContext('2d');
        ctx.translate(this.cas.width / 2, this.cas.height / 2); // 将原点移动到图像中心
        ctx.rotate(-angleInRadians); // 旋转图像
        ctx.drawImage(this.cas, -this.width / 2, -this.height / 2); // 绘制旋转后的图像
        return Img.fromcanvas(canvas);
    }
    opacity(value=255){
        //设置图像不透明度，越大越不透明,取值0~255
        //this.fill(value,3); 这种和下面的用哪种实现？
        if ( this.iscasnew) this.update();
        this.data.forEach(function (x,idx,arr){ if (idx %4==3 ) arr[idx]=value  });
        return this;
    }

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
                let val = this.getel(y,x,cidx);
                const bitValue = (val >> bitnum) & 1;    //提取指定比特位的值
                //bitplaneArray.data[y * this.width + x] = bitValue * 255;
                bitplaneArray.setel(y,x,0,bitValue*255);
            }
        }
        return bitplaneArray;
    }

    
    
    // RGB域转YCbCr域
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

    drawbox(x=50, y=50, w=50, h=50, color='#000000', linewidth=2, fill=false, fillcolor='#000000'){
        //在图像上画一个指定大小的矩形
        if ( ! this.iscasnew) this.update();
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
        this.iscasnew=true;
        return this;
    }

    drawtext({x=50, y=50, text='Hello', color='red', linewidth=2, fontSize=20}={}){
        //在图像上绘制文字
        // 设置文字属性，包括字体大小
        if ( ! this.iscasnew) this.update();
        this.ctx.font = `${fontSize}px Arial`; // 设置字体大小和样式
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = linewidth;
        // 写入文字
        this.ctx.fillText(text, x, y);
        // 将绘制后的图像数据更新到Img对象中
        //this.data = self.ctx.getImageData(0, 0, this.width, this.height).data;
        this.iscasnew=true;
        return this;
    }

    show(cas=null){
        //向网页中插入图像
        let cs=cas ? cas : document.createElement('canvas');
        cs.width=this.width;
        cs.height=this.height;
        if (this.iscasnew) this.update();
        this.tocanvas(cs);
        cas ? null: document.body.appendChild(cs);
        return this;
    }
}


function delay(n) {
    //异步的延时单位是ms
    return new Promise(function(resolve) {
        setTimeout(resolve, n );
    });
}

//当将该文件用于ES6 Module时，取消以下注释，导出Img和ImgArray类
//export {Img, ImgArray} ;