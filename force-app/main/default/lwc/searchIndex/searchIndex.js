import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SearchIndex extends LightningElement {
    @api fieldVal=''; @api fieldOptions; @api operVal='';
    @api operOptions; @api val=''; @api add; @api remove;
    @track childIncrement; @api isInsert; @api isRemove;

    @api evtAddValues;

    sendParams(evt){
        if(this.fieldVal==undefined || this.operVal==undefined || this.val==undefined ||
            this.fieldVal=='' || this.operVal=='' || this.val==''){
            const showToast=new ShowToastEvent({
                "message" : "Select the condtion values!",
                "variant" : "error"
            });
            this.dispatchEvent(showToast);
        }else{
            var evtAddValues={showChild: true, childName: evt.target.name, isAdd: false, isClose: false, actionParam: 'add'};
            const fireAdd=new CustomEvent('addcmp', {detail: evtAddValues});
            this.dispatchEvent(fireAdd);
        }
    }
    handleRemove(evt){
        this.fieldVal='';
        this.operVal='';
        this.val='';
        var evtRemoveValues={showChild: false, childName: evt.target.name,isAdd: true, isClose: true, actionParam: 'remove'};
        const fireRemove=new CustomEvent('addcmp', {detail: evtRemoveValues});
        this.dispatchEvent(fireRemove);
    }
    handleChange(evt){        
        var fName=evt.target.name;
        var validationCheck=false;
        var fVal=evt.target.value;
        if(fName=='sconfig1'){
            this.fieldVal=fVal;
            validationCheck=true;
        }else if(fName=='sconfig2'){
            this.operVal=fVal;
            validationCheck=true;
        }else if(fName=='sconfig3'){
            this.val=fVal;
            validationCheck=true;
        }
        if(validationCheck){
            alert('sending!='+this.cmpNum+' ='+fVal+' ='+fName);
            var searchCriteria={cName: fName, cValue: fVal, cNum: this.cmpNum};
            //const fireFieldChange=new CustomEvent('fieldchanged', {detail: evt.target.value});
            const fireFieldChange=new CustomEvent('fieldchanged', {detail: searchCriteria});
            this.dispatchEvent(fireFieldChange);
        }
    }
}