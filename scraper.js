let fs        = require('fs');
let axios     = require('axios');
let cheerio   = require('cheerio');

const BASE_URL  = 'https://www.lyrics.com/';
const ABC       = [];
const INDEX_A   = 65;
const INDEX_Z   = 90;

for (let index = INDEX_A; index <= INDEX_Z; index++) {
  ABC.push(String.fromCharCode(index));
}

function createFile(name, jsonObj) {
  fs.writeFile('statics/' + name + '.json', JSON.stringify(jsonObj, null, 2), function (err) {
    console.log('Archivo: ' + name + '.json creado');
  })
}

const API_Lyrics = {
  getArtistByAlphabet: (alphabet) => {
    return new Promise((resolve, reject) => {
      console.log(alphabet)
      const base_url = `https://www.lyrics.com/artists/${alphabet}/99999`;
      axios.get(base_url).then((response) => {
        const objPorLetra = {
          letra: alphabet,
          artistas: []
        };
    
        var $ = cheerio.load(response.data);
        $('.tdata tbody tr td strong').each((i, elm) => {
          const name = $(elm).children().eq(0).text();
          const url = $(elm).find('a').attr('href');
          const objArtista = {
            name: name,
            urlToExtractAlbum: BASE_URL + url
          }
          objPorLetra.artistas.push(objArtista)
        });
        resolve(objPorLetra.artistas)
      })
    })
  },
  
  getAlbumByArtistObj: (artistObj) => {
    return new Promise((resolve, reject) => {
      // console.log(artistObj)
      axios.get(artistObj.urlToExtractAlbum).then((response) => {
        
        artistObj.description = null;
        artistObj.thumb = null;
        artistObj.albums = [];
    
        var $ = cheerio.load(response.data);
        
        // Logica para sacar info. del artista
        $('#artist-about').each((i, elm) => {
          const thumb = $(elm).find('.artist-thumb img').attr('src');
          const description = $(elm).find('#artist-bio-ext p.artist-bio').text();
          
          artistObj.description = description;
          artistObj.thumb = thumb;
        });

        // Logica para sacar Los Albums
        $('#artist-about').each((i, elm) => {
          // ...
        });

        // console.log(artistObj);
        resolve(artistObj)
      })
    })
  },

  async processArray(array) {
    var hrstart = process.hrtime();
    let artistas = []
    for (const item in array) {
      artistas.push(await this.getArtistByAlphabet(array[item]))
    }
    createFile('_processArray1', artistas);
    var hrend = process.hrtime(hrstart);
    console.log("Execution time process1 - (hr): ", hrend[0], hrend[1]/1000000);
  },

  async processArray2(array) {
    var hrstart = process.hrtime();
        
    const pArtists = array.map(this.getArtistByAlphabet)
    const rawArtistas = await Promise.all(pArtists)
    const artistas = [].concat(...rawArtistas);
    console.log(artistas)
    createFile('_processArtists2', albums);

    var hrend = process.hrtime(hrstart);
    console.log("Execution time process2 - (hr): ", hrend[0], hrend[1]/1000000);
  },
}

function getArtistas (ABC) {
  for (var i = 0; i < ABC.length; i++) {
    const alphabet = ABC[i]
    var base_url = 'https://www.lyrics.com/artists/' + ABC[i] + '/99999';
    const alpha = axios.get(base_url).then((response) => {
      const objPorLetra = {
        letra: alphabet,
        artistas: []
      };
  
      var $ = cheerio.load(response.data);
      $('.tdata tbody tr td strong').each((i, elm) => {
        const name = $(elm).children().eq(0).text();
        const url = $(elm).find('a').attr('href');
        const objArtista = {
          name: name,
          urlToExtractAlbum: BASE_URL + url
        }
        objPorLetra.artistas.push(objArtista)
      });

      createFile(alphabet, objPorLetra);
    })
  }
}

// getArtistas(ABC)
// API_Lyrics.processArray(ABC)
API_Lyrics.processArray2(ABC)
API_Lyrics.getAlbumByArtistObj({
  name: "B Angie B",
  urlToExtractAlbum: "https://www.lyrics.com/artist/B%20Angie%20B/12279"
})
