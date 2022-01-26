import { cleanFromKeys } from './Functions';
const ExportJsonExcel = require("js-export-excel");

export const handleExport = (data,columns,title,hidden=[]) =>{
	let keys = Object.keys(columns).filter(col=>!hidden.includes(col))
	let name = window.prompt("Comment souhaitez-vous nommer le fichier qui contiendra ces "+data.length+" enregistrements?");		
	if(name){
		var options = {
			fileName: name,
			datas: [{
				sheetName: title || "sheet1",
				sheetHeader: keys.map(col=>columns[col].label || col),
				sheetFilter: keys,
				sheetData: data.map(d=>cleanFromKeys(d,hidden))
			}]
		}
		//opt['title'] = "Export de "+data.length+" enregistrements";
		
		/*const csvExporter = new ExportToCsv(opt);
		 csvExporter.generateCsv(data);*/
		var toExcel = new ExportJsonExcel(options); //new
		toExcel.saveExcel(); 
	}
}