var nb_hours = 24;
export getShema = (type,rule)=>{
		this.setState({load:true});
		if(localStorage.getItem("schema") === null ||
		 !JSON.parse(localStorage.getItem("schema"))[type+'_'+rule]){
			this.callSchema(type,rule);
		}
		else{
			let obj = JSON.parse(localStorage.getItem("schema"))[type+'_'+rule];
			let {created,...stored} = {...obj};
			let dt = new Date().getTime();
			dt-created < 1000*3600*nb_hours ? this.setState({columns:stored['data']}) 
			 : this.callSchema(type,rule)
		}
	}

export getSelect = (rule,params)=>{
		this.setState({load:true});
		if(localStorage.getItem("sel_"+rule) === null){
			this.callSelect(rule,params);
		}
		else{
			let obj = JSON.parse(localStorage.getItem("sel_"+rule));
			let shema = JSON.parse(localStorage.getItem("sch_select"+rule));
			let created = obj[params] ? obj[params]['created'];
			let expireTime = shema['cache_delay'] && shema['cache_delay']; //en minutes
			let dt = new Date().getTime();
			if(expireTime && created && dt-created < expireTime*60000 ){
				this.setState({columns:obj[params]})
			}
			else { this.callSelect(rule,params) }
		}
	}
export getCleanedStorage = type =>{
	if(type === 'schema'){
		let tm = new Date().getTime();
		let ls = JSON.parse(localStorage.getItem("schema"));
		Object.keys(ls).map(t=>{
			Object.keys(ls[t]).map(rule=>{ ls[t][rule].expire > tm && delete ls[t][rule] }) 
		})
	}
	else if( ['insert','update'].includes(type) ) {
		let ls = JSON.parse(localStorage.getItem(`${type}Cache`));
		Object.keys(ls).map(rule=>{
			let valids = ls[rule].filter(record=>{return record.nbTry < record.nbMaxTry});
			if(valids.length > 0) { ls[rule] = valids }
			else { delete ls[rule] }
		})
	}
	else { console.log("type inconnu"); return false }
	return ls;
}

export unmountContext = (state,rule) =>{
	//storage de la mise en cache des insert/update non passés
	["insert","update"].map(type=>{
			let cached = state[`${type}Cache`][rule] || [];
			let storage = getCleanedStorage(type);
			cached.map(ca=>{
				if(ca.nbTry < ca.nbMaxTry) { storage[rule] ? storage[rule].push(ca) : storage[rule]=ca } 
			});
			localStorage.setItem(type,JSON.stringify(storage));
			delete state[`${type}Cache`][rule];
	})
}
export cleanContext = (state,rule,type="select") =>{
	let ty = type === "select" ? type : `${type}Cache`;
	let st = {...state};
	delete st[ty][rule];
	return st;
}