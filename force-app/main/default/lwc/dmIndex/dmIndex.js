import { LightningElement, track, wire, api } from 'lwc';
import getObjs from '@salesforce/apex/DmHome.getObjList';
import getObjField from '@salesforce/apex/DmHome.getObjFields';
import SearchIndex, { myCmp } from 'c/searchIndex';

export default class DmHome extends LightningElement {
    /*@track isChildCmp1=true; @track isChildCmp2=false; @track isChildCmp3=false; @track isChildCmp4=false;
    @track isChildCmp5=false; @track isChildCmp6=false; @track isChildCmp7=false; @track isChildCmp8=false; 
    @track isChildCmp9=false; */

    @api inputVal1; @api inputVal2; @api inputVal3; @api inputVal4; @api inputVal5;
    @api inputVal6; @api inputVal7; @api inputVal8; @api inputVal9; @api inputVal10;

    @api fieldVal1; @api fieldVal2; @api fieldVal3; @api fieldVal4; @api fieldVal5;
    @api fieldVal6; @api fieldVal7; @api fieldVal8; @api fieldVal9; @api fieldVal10;
    @track selectedObj; 

    @api operVal1='='; @api operVal2='='; @api operVal3='='; @api operVal4='='; @api operVal5='='; 
    @api operVal6='='; @api operVal7='='; @api operVal8='='; @api operVal9='='; @api operVal10='=';
    @api operOptions;

    @track isChildCmp; @track sortField; @track sortVal;
    @track recycle=false; @track purge=false; @track filterBool=false; @track isPurge=true;

    @track objOptions=[]; @track tempOptions=[]; @track objsOptions=[]; @api fieldOptions=[]; @api fieldSet=[];

    @track objError; @track fieldError;

    @track childCmp={c0: true,c1: false,c2: false, c3: false, c4: false, c5: false, c6: false,
                    c7: false, c8: false, c9: false};
    
    @api insertEnabled={c0: false,c1: true,c2: true, c3: true, c4: true, c5: true, c6: true,
                            c7: true, c8: true, c9: true};
    @api insertDisabled={c0: true,c1: false,c2: true, c3: true, c4: true, c5: true, c6: true,
                            c7: true, c8: true, c9: true};
    
    @track operTempData={}; @api childCount=1;

    childBools=[{"label":"c0","value":true},{"label":"c1","value":false},
                {"label":"c2","value":false},{"label":"c3","value":false},
                {"label":"c4","value":false},{"label":"c5","value":false},
                {"label":"c6","value":false},{"label":"c7","value":false},
                {"label":"c8","value":false},{"label":"c9","value":false}];

    strType=[{'label': 'equals', 'value': '='}, {'label': 'not equals', 'value': '<>'},
            {'label': 'starts with', 'value': 'like'},
            {'label': 'ends with', 'value': 'like'},
            {'label': 'contains', 'value': 'like'},
            {'label': 'is null', 'value': '='},
            {'label': 'in', 'value': 'in'},
            {'label': 'not in', 'value': 'not in'}];
    dateType=[{'label': 'equals', 'value': 'equals'}, {'label': 'not equals', 'value': 'not equals'},
            {'label': 'less than', 'value': 'less than'},
            {'label': 'greater than', 'value': 'greater than'},
            {'label': 'less than or equal', 'value': 'less than or equal'},
            {'label': 'greater than or equal', 'value': 'greater than or equal'},
            {'label': 'is null', 'value': 'is null'}];
    boolType=[{'label': 'equals', 'value': 'equals'}, {'label': 'not equals', 'value': 'not equals'},
              {'label': 'is null', 'value': 'is null'}];
    
    get sortOptions(){
        return [{"label":"asc","value": "asc"},{"label":"desc","value": "desc"}];
    }
    
    @wire(getObjs)
    getObjList({ error, data }){
        if(data){
            this.tempOptions=data;
            this.objError=undefined;
        }else if(error){
            this.objOptions=undefined;
            this.objError=error;
        }
    }
    get objectOptions(){
        var returnOptions = [];
        returnOptions.push({label: '',value: ''});
        this.tempOptions.forEach(ele =>{
            returnOptions.push({label: ele, value: ele});
        });
        return returnOptions;
    }
    handleChange(evt){
        if(evt.target.name=='obj'){
            this.selectedObj=evt.target.value;
            getObjField({obj: evt.target.value})
            .then(result =>{
                const returnFields=[];
                const returnFieldTypeSet=[];
                returnFields.push({label: '', value: ''});
                for(var a in result){
                    returnFields.push({label: a, value: a});
                    returnFieldTypeSet.push({label: a, value: result[a]});
                    //this.operTempData[a] = result[a];
                }
                this.fieldOptions=returnFields;
                this.fieldSet=returnFieldTypeSet;
                //this.setOperatorOptions();
                this.fieldError=undefined;
            })
            .catch(error =>{
                this.fieldError=error;
                this.fieldOptions=undefined;
            })
        }else if(evt.target.name=='cbox1'){
            this.recycle=evt.target.checked;
            console.log('att='+evt.target.checked);
            if(evt.target.checked==true){
                this.isPurge=false;
            }else{
                this.isPurge=true;
            }
        }else if(evt.target.name=='cbox2'){
            this.purge=evt.target.checked;
        }
    }
    handleAdd(evt){
        var sChild=evt.detail.showChild;
        var nChild=evt.detail.childName;
        var isPlus=evt.detail.isAdd;
        var isCross=evt.detail.isClose;
        var isParam=evt.detail.actionParam;
        /*for(var key in this.operTempData){
            console.log('add1'+key);
            console.log('add2'+this.operTempData[key]);
        }*/
        for(var key in this.childCmp){
            if(key==nChild){
                this.childCmp[key]=sChild;
                this.insertEnabled[key]=isPlus;
                if(nChild!='c1'){
                    this.insertDisabled[key]=isCross;
                }else if(nChild=='c1' && isParam!='remove'){
                    this.insertDisabled[key]=isCross;
                }
            }
            if(isParam=='add'){
                this.childCount++;
            }else if(isParam=='remove'){
                this.childCount--;
            }
        }
    }
    handleFieldChange(evt){
        alert('received!='+evt.detail.cNum+' ='+evt.detail.cValue+' ='+evt.detail.cName);
        for(var key in this.fieldSet){
            if(this.fieldSet[key].label==evt.detail.cValue && (this.fieldSet[key].value=="STRING" || 
                this.fieldSet[key].value=="Phone" || this.fieldSet[key].value=="Email" ||
                this.fieldSet[key].value=="TEXTAREA" || this.fieldSet[key].value=="REFERENCE" ||
                this.fieldSet[key].value=="ID" || this.fieldSet[key].value=="CURRENCY" ||
                this.fieldSet[key].value=="DOUBLE" || this.fieldSet[key].value=="DECIMAL")){
                  this.operOptions=this.strType;
              }else if(this.fieldSet[key].label==evt.detail.cValue && (this.fieldSet[key].value=="Date" || 
                this.fieldSet[key].value=="DATETIME")){
                    this.operOptions=this.dateType;
             }else if(this.fieldSet[key].label==evt.detail.cValue && this.fieldSet[key].value=="BOOLEAN"){
                this.operOptions=this.boolType;
             }
        }
        if(evt.detail.cNum=='1'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal1=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal1=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal1=evt.detail.cValue;
            }
         }else if(evt.detail.cNum=='2'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal2=evt.detail.cValue;
                alert('2');
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal2=evt.detail.cValue;
                alert('2');
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal2=evt.detail.cValue;
                alert('2');
            }
         }else if(evt.detail.cNum=='3'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal3=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal3=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal3=evt.detail.cValue;
            }
         }else if(evt.detail.cNum=='4'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal4=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal4=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal4=evt.detail.cValue;
            }
         }else if(evt.detail.cNum=='5'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal5=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal5=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal5=evt.detail.cValue;
            }
         }else if(evt.detail.cNum=='6'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal6=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal6=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal6=evt.detail.cValue;
            }
         }else if(evt.detail.cNum=='7'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal7=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal7=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal7=evt.detail.cValue;
            }
         }else if(evt.detail.cNum=='8'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal8=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal8=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal8=evt.detail.cValue;
            }
         }else if(evt.detail.cNum=='9'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal9=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal9=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal9=evt.detail.cValue;
            }
         }else if(evt.detail.cNum=='10'){
            if(evt.detail.cName=='sconfig1'){
                this.fieldVal10=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig2'){
                this.operVal10=evt.detail.cValue;
            }else if(evt.detail.cName=='sconfig3'){
                this.inputVal10=evt.detail.cValue;
            }
         }/*else if(evt.detail.cName=='sconfig2'){
            if(evt.detail.cNum=='1'){
                this.fieldVal1=evt.detail.cValue;
            }else if(evt.detail.cNum=='2'){
                this.fieldVal2=evt.detail.cValue;
            }else if(evt.detail.cNum=='3'){
                this.fieldVal3=evt.detail.cValue;
            }else if(evt.detail.cNum=='4'){
                this.fieldVal4=evt.detail.cValue;
            }else if(evt.detail.cNum=='5'){
                this.fieldVal5=evt.detail.cValue;
            }else if(evt.detail.cNum=='6'){
                this.fieldVal6=evt.detail.cValue;
            }else if(evt.detail.cNum=='7'){
                this.fieldVal7=evt.detail.cValue;
            }else if(evt.detail.cNum=='8'){
                this.fieldVal8=evt.detail.cValue;
            }else if(evt.detail.cNum=='9'){
                this.fieldVal9=evt.detail.cValue;
            }else if(evt.detail.cNum=='10'){
                this.fieldVal10=evt.detail.cValue;
            }
         }*/
    }
    hanldePreview(evt){
        var domElem=this.template.querySelector('c-search-index');
        if(this.selectedObj==undefined || this.selectedObj==''){
            alert('Select object!');
        }else{
            var validatePreview=false;
            var qString='Select Id from '+this.selectedObj;
            if(this.fieldVal1!=undefined && this.inputVal1!=undefined){
                qString+=' where '+this.fieldVal1+this.operVal1+this.inputVal1;
                validatePreview=true;
            }
            if(this.fieldVal2!=undefined && this.inputVal2!=undefined){
                alert('alert 2');
                qString+=' and '+this.fieldVal2+this.operVal2+this.inputVal2;
            }
            if(this.fieldVal3!=undefined && this.inputVal3!=undefined){
                qString+=' and '+this.fieldVal3+this.operVal3+this.inputVal3;
            }
            if(this.fieldVal4!=undefined && this.inputVal4!=undefined){
                qString+=' and '+this.fieldVal4+this.operVal4+this.inputVal4;
            }
            if(this.fieldVal5!=undefined && this.inputVal5!=undefined){
                qString+=' and '+this.fieldVal5+this.operVal5+this.inputVal5;
            }
            if(this.fieldVal6!=undefined && this.inputVal6!=undefined){
                qString+=' and '+this.fieldVal6+this.operVal6+this.inputVal6;
            }
            if(this.fieldVal7!=undefined && this.inputVal7!=undefined){
                qString+=' and '+this.fieldVal7+this.operVal7+this.inputVal7;
            }
            if(this.fieldVal8!=undefined && this.inputVal8!=undefined){
                qString+=' and '+this.fieldVal8+this.operVal8+this.inputVal8;
            }
            if(this.fieldVal9!=undefined && this.inputVal9!=undefined){
                qString+=' and '+this.fieldVal9+this.operVal9+this.inputVal9;
            }
            if(this.fieldVal10!=undefined && this.inputVal10!=undefined){
                qString+=' and '+this.fieldVal10+this.operVal10+this.inputVal10;
            }
            alert('query='+qString);
        }
    }
}