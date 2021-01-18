public class DmHome {
	@AuraEnabled(cacheable=true)
    public static List<String> getObjList(){
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
        List<String> systemSObjs=New List<String>();
        for(Schema.SObjectType sobj: gd.values()){
            String name = sobj.getDescribe().getName();
            if(!name.containsignorecase('history') && !name.containsignorecase('tag')&&
               !name.containsignorecase('share') && !name.containsignorecase('feed')){
                   systemSObjs.add(String.valueOf(sobj));
               }
        }
        systemSObjs.sort();
        return systemSObjs;
    }
    @AuraEnabled(cacheable=true)
    public static Map<String, String> getObjFields(String obj){
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        Map<String, Schema.SObjectField> fieldMap = schemaMap.get(obj).getDescribe().fields.getMap();
        Map<String, String> fieldSet=New Map<String,String>();
        for(Schema.SObjectField apiName: fieldMap.Values()){
            Schema.DescribeFieldResult dfield=apiName.getDescribe();
            fieldSet.put(String.valueOf(apiName),String.valueOf(dfield.getType ()));
        }
        return fieldSet;
    }
}
/*
https://developer.salesforce.com/forums/?id=906F000000090fnIAA
*/