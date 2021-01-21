import { LightningElement, track, wire, api } from 'lwc';
import getObjs from '@salesforce/apex/DmHome.getObjList';
import getObjField from '@salesforce/apex/DmHome.getObjFields';
import SearchIndex, { myCmp } from 'c/searchIndex';

export default class DmHome extends LightningElement {

    @track objsOptions=[];  

    //Cmp variables
    @track selectedObj; @track recycle=false; @track purge=false; @track isPurge=true;
    @api fieldVal;@api fieldOptions=[];@api operVal='='; @api operOptions; val; @api fieldSet=[];
    @track filterBool=false; @track sortField; @track sortVal; 
    @track tempOptions=[];@track objOptions=[];
    qFields;qConditions;
    @track objError; @track fieldError;
    @track overrideField;@track concateField;@track overrideValue; @track concateOptions;

    @track operTempData={}; @api childCount=1;

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
    get overrideOptions(){
        var returnOptions = [];
        returnOptions.push({label: '',value: ''});
        this.fieldSet.forEach(element =>{
            if(element.label!='Id' && element.label!='IsDeleted' && element.label!='CreatedDate' && 
                element.label!='CreatedById' && element.label!='LastModifiedDate' && element.label!='LastModifiedById' &&
                element.label!='SystemModstamp' && element.label!='LastActivityDate' && element.label!='LastViewedDate' &&
                element.label!='LastReferencedDate' && element.label!='DandbCompanyId' && element.label!='OperatingHoursId' && 
                (element.value=='STRING' || element.value=='PICKLIST' || element.value=='TEXTAREA' || element.label=='ParentId' ||
                element.value=='DOUBLE' || element.value=='PHONE' || element.value=='URL' ||
                element.value=='CURRENCY' || element.value=='INTEGER' || element.label=='OwnerId')){
                returnOptions.push({label: element.label, value: element.label});
            }
        });
        return returnOptions;
    }/*
    get manipulateOptions(){
        var returnOptions = [];
        returnOptions.push({label: '',value: ''});
        this.fieldSet.forEach(element =>{
            if(element.value=='STRING' || element.value=='TEXTAREA'){
                returnOptions.push({label: element.label, value: element.label});
                console.log('ele value='+element.value);
                console.log('ele label='+element.label);
            }
        });
        return returnOptions;
    }*/
    handleChange(evt){
        if(evt.target.name=='obj'){
            this.selectedObj=evt.target.value;
            getObjField({obj: evt.target.value})
            .then(result =>{
                const returnFields=[];
                const returnFieldTypeSet=[];
                const overrideData=[];
                const concateData=[];
                returnFields.push({label: '', value: ''});
                for(var a in result){
                    returnFields.push({label: a, value: a});
                    returnFieldTypeSet.push({label: a, value: result[a]});
                    if(result[a]=='STRING' || result[a]=='TEXTAREA'){
                        concateData.push({label: a, value: a});
                        console.log('value='+result[a]);
                        console.log('label='+a);
                    }
                }
                this.fieldOptions=returnFields;
                this.fieldSet=returnFieldTypeSet;
                this.concateOptions=concateData;
                this.fieldError=undefined;
            })
            .catch(error =>{
                this.fieldError=error;
                this.fieldOptions=undefined;
            })
        }else if(evt.target.name=='cbox1'){
            this.recycle=evt.target.checked;
            if(evt.target.checked==true){
                this.isPurge=false;
            }else{
                this.isPurge=true;
                this.purge=false;
            }
        }else if(evt.target.name=='cbox2'){
            this.purge=evt.target.checked;
        }else if(evt.target.name=='sconfig1'){
            this.val=null;
            for(var key in this.fieldSet){
                if(this.fieldSet[key].label==evt.target.value && (this.fieldSet[key].value=="STRING" || 
                    this.fieldSet[key].value=="Phone" || this.fieldSet[key].value=="Email" ||
                    this.fieldSet[key].value=="TEXTAREA" || this.fieldSet[key].value=="REFERENCE" ||
                    this.fieldSet[key].value=="ID" || this.fieldSet[key].value=="CURRENCY" ||
                    this.fieldSet[key].value=="DOUBLE" || this.fieldSet[key].value=="DECIMAL")){
                      this.operOptions=this.strType;
                  }else if(this.fieldSet[key].label==evt.target.value && (this.fieldSet[key].value=="Date" || 
                    this.fieldSet[key].value=="DATETIME")){
                        this.operOptions=this.dateType;
                 }else if(this.fieldSet[key].label==evt.target.value && this.fieldSet[key].value=="BOOLEAN"){
                    this.operOptions=this.boolType;
                 }
            }
        }else if(evt.target.name=='sconfig2'){
            this.operVal=evt.target.value;
        }else if(evt.target.name=='sconfig3'){
            this.val=evt.target.value;
            console.log('sconfig3='+this.val);
        }
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