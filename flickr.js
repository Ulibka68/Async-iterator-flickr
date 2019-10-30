// https://beta.observablehq.com/@mpj/code-for-using-async-generators-to-stream-data-in-javascrip
// https://www.flickr.com/services/api/explore/flickr.photos.search
// https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=5989617c0a5018ae4ee610b0c8b25e0e&tags=cat&
// per_page=100&format=json&nojsoncallback=1&auth_token=72157677475402458-56a865ba0cf39e29&api_sig=7b087183bd9246387e394f412d8bfbb4

/*


Key:
5989617c0a5018ae4ee610b0c8b25e0e

Secret:
2e114b797a91e1f6

https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=5989617c0a5018ae4ee610b0c8b25e0e&tags=cat&format=json&nojsoncallback=1

{
    for await(const url of cats)
        yield html`<img src="${url}" style="width: 150px; height: 150px" />`
}

cats = Object {
    Symbol(Symbol.asyncIterator): async ƒ*()
}
*/

const getApiKey = () => '5989617c0a5018ae4ee610b0c8b25e0e';

function flickrTagSearchF(tag) {

    // Returns a promise that resolves after _seconds_
    const delay = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));
    

    // Returns a Promise that resolves to an array of urls to images that
    // represents a (paged) result of a tag search on Flickr.
    function flickrTagSearch (tag, page) {
        const apiKey = getApiKey();
        return fetch(
            'https://api.flickr.com/services/rest/' +
            '?method=flickr.photos.search' +
            '&api_key=' + apiKey +
            '&page=' + page +
            '&per_page=20'+
            '&tags=' + tag +
            // '&text=' + tag +
            '&content_type=1'+
            '&sort=relevance'+
            '&in_gallery=true'+
            // '&is_commons=true'+
            '&tag_mode=AND' +
            '&format=json' +
            '&nojsoncallback=1'
        )
            .then(response => response.json())
            .then(body => body.photos.photo)
            .then(photos => photos.map(photo =>
                `https://farm${photo.farm}.staticflickr.com/` +
                `${photo.server}/${photo.id}_${photo.secret}_q.jpg`
            ));
    }

    return {
        /*
        [Symbol.asyncIterator]: async function*() {
            let pageIndex = 1;
            while(true) {
                const pageData = await flickrTagSearch(tag, pageIndex);
                for (const url of pageData) {
                    await delay(2);
                    yield url;
                }
                pageIndex = pageIndex + 1;
            }
        }
        */

        [Symbol.asyncIterator]: function() {
          let pageIndex = 0;
          let photoIndex = -1;
          let cache = null;

          const fillCache = page =>
            flickrTagSearch(tag, page).then(photos => {
              cache = photos
            });

          return {
            next: function() {
              photoIndex++;

              if (cache && cache[photoIndex])
                return {
                  done: false,
                  value: cache[photoIndex]
                };

              photoIndex = 0;
              pageIndex = pageIndex + 1;
              return fillCache(pageIndex)
                .then(() => delay(1))
                .then(() => ({
                  done: false,
                  value: cache[photoIndex]
                }))
            }
          }
        }
    }
}


// параметры вызова поиска фотографий описаны тут :
// https://www.flickr.com/services/api/explore/flickr.photos.search
// функция возвращает promise
 function flickrTagSearchPromice (tag, page=1) {
  const apiKey = getApiKey();
  return fetch(
      'https://api.flickr.com/services/rest/' +
      '?method=flickr.photos.search' +
      '&api_key=' + apiKey +
      '&page=' + page +
      '&per_page=20'+
      '&tags=' + tag +
      // '&text=' + tag +
      '&content_type=1'+
      '&sort=relevance'+
      '&in_gallery=true'+
      // '&is_commons=true'+
      '&tag_mode=AND' +
      '&format=json' +
      '&nojsoncallback=1'
  )     
  .then(response => { 
    if (response.ok)  { // если HTTP-статус в диапазоне 200-299
        // получаем тело ответа 
        return response.json(); // json тоже вернет promice
            // .then (data => {
            
            // Пример вывода
            // photos:
            //     page: 1
            //     pages: 55218
            //     perpage: 20
            //     photo: (20) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
            //     total: "1104341"
            // stat: "ok"

            // Один элементЖ
            // 0:
            // farm: 66
            // id: "48971887813"
            // isfamily: 0
            // isfriend: 0
            // ispublic: 1
            // owner: "16854222@N05"
            // secret: "efdce9d68c"
            // server: "65535"
            // title: "Paddling Towards New Adventures"

            //     console.log(data);
            //     console.log(data.photos.photo.length);
            //     console.log(data.photos.photo[0]);
            //     return data;
            // });

    } else {
      alert('Ошибка HTTP :' + response.status);
    }
 })
.catch(err => {console.log('Fetch Error :',err)});

}


// https://javascript.info/async-iterators-generators

