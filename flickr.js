// https://beta.observablehq.com/@mpj/code-for-using-async-generators-to-stream-data-in-javascrip
// https://www.flickr.com/services/api/explore/flickr.photos.search


function flickrTagSearchF(tag) {

    // Returns a promise that resolves after _seconds_
    const delay = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000));
    // вставьте ключ отсюда:
    // https://www.flickr.com/services/apps/create/
    const getApiKey = () => '';

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


