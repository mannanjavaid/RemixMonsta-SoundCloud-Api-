var DEFAULT_PAGE_SIZE = 10;
var one_day = 1000 * 60 * 60 * 24;
var playList = [];
var trackList = [];
SC.initialize({
    client_id: '4af6a761ec1726ad9b2e0e2397fe898a'
});

var storedNames = JSON.parse(localStorage.getItem("playlist"));


getTrack("House", DEFAULT_PAGE_SIZE);
//getTrack("rock", DEFAULT_PAGE_SIZE);
//getTrack("electronic", DEFAULT_PAGE_SIZE);

console.log(trackList);
var date = new Date().getTime();
var current = new Date(date);
var difference_ms = new Date() - current;

// Convert back to days and return
var difference = Math.round(difference_ms / one_day);

//localStorage.setItem("playlist", JSON.stringify(trackList));

//playSong("321208965");


//remove song from playList
function removeFromPlayList(track) {
    var index = playList.findIndex(track);
    if (index > 0) {
        playList.splice(index, 1);
    }
}


//  add song to playList
function addToPlayList(track) {
    if (!localStorage.getItem('playListTime')) {
        localStorage.setItem("playListTime", new Date().getTime());
    }
    playList.push(track);
    var title = track.title;
    if (track.title.length > 25) {
        title = track.title.substring(0, 25) + '...';

    }
    var songRow = '<div class="song-info"><img src="' + track.artwork_url + '" width="70" height="70" class="album-covers" align="left" />' +
        '<div class="info"><span class="song-title">' + title + '</span><span class="song-duration"> </span></div>' +
        '<div class="stats"><span class="play-button"> s</span><span class="count"> </span><span class="genre">Remove</span></div></div >'

    $('.playlist-songs').append(songRow);
}



//play specefic song
function playSong(track) {
    var trackId = track.id;

    SC.stream("/tracks/" + trackId).then(function (sound) {
        if (sound.options.protocols[0] === 'rtmp') {
            sound.options.protocols.splice(0, 1);
        }
        sound.play();


        sound.on("time", function () {
            $(".timeline").css('width', ((sound.currentTime() / sound.options.duration) * 100) + '%');
            $(".footer .current-time").text(moment.utc(sound.currentTime()).format('mm:ss'));
        });
        var title = track.title;
        if (track.title.length > 50) {
            title = track.title.substring(0, 50) + '...';

        }
        $('.footer .album-cover').attr("src", track.artwork_url);
        $('.footer .song-title').text(title);
        $('.footer .total-time').text(moment.utc(sound.options.duration).format('mm:ss'));
       
        $(".song-timeline").click(function (e) {
            var x = e.pageX - $(this).offset().left;
            var width = $(this).width();
            var duration = sound.options.duration;
            sound.seek((x / width) * duration);
        });
    });
}

// get tracks for specefix gener
function getTrack(genre, pageSize) {
    var array = [];
    SC.get('/tracks', {
        q: 'remix', genres: genre, created_at: {
            from: moment().subtract(2, 'days').format('YYYY-MM-DD  00:00:01'),
            to: moment().format('YYYY-MM-DD  00:00:01')
        }, limit: pageSize
    }).then(function (tracks) {
        console.log(trackList);
        for (var i = 0; i < tracks.length; i++) {
            trackList.push(tracks[i]);
            var title = tracks[i].title;
            if (tracks[i].title.length > 45) {
                title = tracks[i].title.substring(0, 45) + '...';

            }

            var songRow = ' <div class="row song"> <div class="col-lg-1 song-number">' + trackList.length + '</div>' +
                '<div class="col-lg-7 song-info" > <img src="' + tracks[i].artwork_url + '" width="48" height="48" class="album-cover">' +
                '<span class="song-title">' + title + '</span> </div>' +
                '<div class="col-lg-3 add-playlist"> <div class="genre">Add to playlist<img class="genre-image" src="Images/tick.svg" width="17" height="13"> </div></div>' +
                '<div class="col-lg-2 play-count">' + tracks[i].likes_count + ' /' + tracks[i].playback_count + ' </div></div>'

            $('.trackList').append(songRow);
        }
    });

}









