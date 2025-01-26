// Utils and Consts

const $ = (args)=> document.querySelector(args) || {}
const Key = {
    Enter : 13
}


// Files

let Files = {}

function file_load( filepath ) {
    return new Promise( (resolve, reject) => {
        fetch( filepath )
        .then( r => r.text() )
        .then( text => resolve(text) )    
    } )
}

function file_read(filename) {
    const file = Files[filename];
    if (file === undefined ) throw new Error(`Failed to read file '${filename}'`);
    return file
}

function file_load_all() {
    Promise.all( [
        file_load("results-template").then( text => Files["results-template"] = text ),
    ] )
    .then( main )
}

function main() {

    var Results = {
        template : Handlebars.compile( file_read("results-template") ),
        component: $("#results"),
        data     : []
    }

    function results_render() {
        Results.component.innerHTML = Results.template( {results: Results.data } )        
    }

    var Search = {
        component: $("#search"),
        data: "",
    }

    function search_onkeyup( event ) {

        if( event.keyCode != Key.Enter ) {
            return
        }

        Search.data = Search.component.value;
        let results = {};
        let words = Search.data.split(" ").map(e => e.trim().toLowerCase() ).filter( e=> e != "" )
        let search_text = words.join(" ")

        // exact word
        for(let word of words) {
            let results_found = DB[word]
            if( results_found !== undefined ) {
                for( let r of results_found ) {
                    if( results[ r ] == undefined ) {
                        results[ r ] = 0
                    }
                    results[ r ] += 1
                }
            }
        }

        let results_info = []

        for( let [ item_id , hits ] of Object.entries( results ) ){
            let item          = INFO[ item_id ]
            item.hits         = hits

            // if it hit all words, check if is a perfect match
            if ( hits == words.length ) {
                if( item.text.toLowerCase().indexOf(search_text) !== -1 ) {
                    item.hits += 10000
                }
                results_info.push( item )
            }
        }

        results_info.sort( (a, b) => b.hits - a.hits )

        Results.data = results_info
        results_render()
    };

    function search_init() {
        Search.component.onkeyup = (e)=> search_onkeyup(e)
    }
    search_init()
}

file_load_all()