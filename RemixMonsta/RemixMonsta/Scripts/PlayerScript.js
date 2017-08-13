var DEFAULT_PAGE_SIZE = 100;
var MIN_TRACK_DURATION = 2;
var MAX_TRACK_DURATION = 10;
var one_day = 1000 * 60 * 60 * 24;
var playList = [];
var randomPlayList = [];
var trackList = [];
var randomTrackList = [];
var searchList = [];
var currentTrack;
var player;
var listRefreshTime;
var isSearch = false;
var isRandomPlay = false;
var isPlaylist = false;
var isRandomPlayList = false;
var isFirstPlayBack = false;

SC.initialize({
    client_id: '4af6a761ec1726ad9b2e0e2397fe898a'
});
if (localStorage.getItem('playlist')) {
    playList = JSON.parse(localStorage.getItem("playlist"));
}

getTrack("House", DEFAULT_PAGE_SIZE);
getTrack("Dance &amp; EDM", DEFAULT_PAGE_SIZE);
getTrack("Pop", DEFAULT_PAGE_SIZE);
getTrack("Latest 25", DEFAULT_PAGE_SIZE);

var date = new Date().getTime();
var current = new Date(date);
var difference_ms = new Date() - current;

// Convert back to days and return
var difference = Math.round(difference_ms / one_day);



// this fuction check if song already in playlist
function checkIfTrackAlreadyInPlayList(track) {
    if (playList == null) { return false; }
    var index = getIndexFromPlayListByid(track.id);
    if (index >= 0)
        return true;
    else
        return false;

}


// get tack from play list  by id
function getTrackFromPlayListByid(id) {
    var track;
    for (var i = 0; i < playList.length; i++) {
        if (playList[i].id == id) {
            track = playList[i];
            break;
        }
    }
    return track;


}


// this function return  index from given list
function getIndexFromListByid(trackList, id) {
    var index = -1;
    for (var i = 0; i < trackList.length; i++) {
        if (trackList[i].id == id) {
            index = i;
            break;
        }
    }
    return index;
}


// this function return  index from play list
function getIndexFromPlayListByid(id) {
    var index = -1;
    for (var i = 0; i < playList.length; i++) {
        if (playList[i].id == id) {
            index = i;
            break;
        }
    }
    return index;
}

//remove song from playList
function removeFromPlayList(track) {
    if (!localStorage.getItem('playListTime')) {
        localStorage.setItem("playListTime", JSON.stringify(new Date().getTime()));
    }

    var index = getIndexFromPlayListByid(track.id);
    if (index >= 0) {
        playList.splice(index, 1);
        localStorage.setItem("playlist", JSON.stringify(playList));
        $('.playlist-songs .track-' + track.id).remove();
        $('#' + track.id + ' .genre').toggleClass("selected-genre");
        $('#' + track.id + ' .genre .text').text("Add to playlist");
        updatePlayListCountAndTime();
    }
}


//  add song to playList
function addToPlayList(track) {
    if (!localStorage.getItem('playListTime')) {
        localStorage.setItem("playListTime", new Date().getTime());

    }
    if (playList == null) { playList = []; }
    playList.push(track);
    localStorage.setItem("playlist", JSON.stringify(playList));
    $('#' + track.id + ' .genre .text').text("Added");
    $('#' + track.id + ' .genre').toggleClass("selected-genre");
    $('.playlist-songs').append(getplayListTrackHtml(track));
    updatePlayListCountAndTime();
}


// this function return playlist track in html format
function getplayListTrackHtml(track) {

    var title = track.title;
    if (track.title.length > 40) {
        title = track.title.substring(0, 40) + '...';

    }
    if (track.artwork_url == null) {

        track.artwork_url = 'Images/favicon.png';
    }
    var info = '<div class="song-info track-' + track.id + '"><img src="' + track.artwork_url + '" width="70" height="70" class="album-covers" align="left" />' +
        '<div class="album-cover-overlay hide-overlay"><img width=22 alt="play" src="Images/play.svg" ></div>' +
        '<div class="info"><span class="song-title">' + title + '</span><span class="song-duration">' + moment.utc(track.duration).format('mm:ss') + '</span></div>' +
        '<div class="stats"><span class="now-playing">Now playing <span class="rectangle-1"></span><span class="rectangle-2"></span><span class="rectangle-3"></span></span><span class="genre">Remove</span></div></div >';

    return info;

}

function setCookie(cname, cvalue, exdays) {
    var date = new Date();
    date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000); // ) removed
    var expires = "; expires=" + date.toGMTString(); // + added
    document.cookie = cname + "=" + cvalue + expires + ";path=/"; // + and " added
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// this function update playlist count an duration
function updatePlayListCountAndTime() {
    var duration = 0;
    for (var i = 0; i < playList.length; i++) {
        duration += playList[i].duration;
    }
    $('.playlist-count').text(playList.length + ' tracks');
    $('.playlist-time').text(moment.utc(duration).format('m') + ' mins');

}


// this function load play list on page load
function loadPlayList() {
    for (var i = 0; i < playList.length; i++) {
        $('.playlist-songs').append(getplayListTrackHtml(playList[i]));
    }
    updatePlayListCountAndTime();
}

// this function play previous song
function playPrevSong() {
    if (player == null) { return }

    // for playlist
    if (isPlaylist) {

        var list = playList;
        if (isRandomPlayList) {
            list = randomPlayList;
        }
        var currentIndex = getIndexFromListByid(list, currentTrack.id);
        // player.dispose();
        if (list.length > currentIndex - 1) {
            playSong(list[currentIndex - 1]);
        } else {
            playSong(list[0]);
        }


    }
    // for tracklist
    else {
        var list = trackList;
        if (isRandomPlay) {
            list = randomTrackList;
        }
        var currentIndex = getIndexFromListByid(list, currentTrack.id);
        //  player.dispose();
        if (list.length > currentIndex - 1) {
            playSong(list[currentIndex - 1]);
        } else {
            playSong(list[0]);
        }
    }
}

// this function plays next song
function playNextSong() {
    if (player == null) { return }

    // for playlist
    if (isPlaylist) {

        var list = playList;
        if (isRandomPlayList) {
            list = randomPlayList;
        }
        var currentIndex = getIndexFromListByid(list, currentTrack.id);
        //   player.dispose();
        if (list.length > currentIndex + 1) {
            playSong(list[currentIndex + 1]);
        } else {
            playSong(list[0]);
        }


    }
    // for tracklist
    else {
        var list = trackList;
        if (isRandomPlay) {
            list = randomTrackList;
        }
        var currentIndex = getIndexFromListByid(list, currentTrack.id);
        // player.dispose();
        if (list.length > currentIndex + 1) {
            playSong(list[currentIndex + 1]);
        } else {
            playSong(list[0]);
        }
    }

}

// play random playlist songs
function toggleRandomPlayList() {
    if (isRandomPlayList) {
        isRandomPlayList = false;
        $('.shuffle-big img').attr('src', 'Images/random_play.svg');

    } else {
        $('.shuffle-big img').attr('src', 'Images/random_play_selected.svg');
        isRandomPlayList = true;
        randomPlayList = playList.slice();
        randomPlayList.sort(function (a, b) { return 0.5 - Math.random() });
        if (randomPlayList.length > 0) {
            isPlaylist = false;
            isSearch = false;
            playSong(randomPlayList[0]);
        }
    }
}



// play random songs
function toggleRandomTracks() {
    if (isRandomPlay) {
        isRandomPlay = false;
        $('.controlls .random_song').attr('src', 'Images/random_play.svg');

    } else {
        isRandomPlay = true;
        $('.controlls .random_song').attr('src', 'Images/random_play_selected.svg');
        randomTrackList = trackList.slice();
        randomTrackList.sort(function (a, b) { return 0.5 - Math.random() });


    }
}


//play specefic song
function playSong(track, repeat = true) {
    if (player != null) {
        player.dispose();
    }
    var trackId = track.id;

    SC.stream("/tracks/" + trackId).then(function (sound) {
        player = sound;
        if (sound.options.protocols[0] === 'rtmp') {
            sound.options.protocols.splice(0, 1);
        }


        sound.play();




        $(".track_volume").css('width', ((sound.getVolume() / 1) * 100) + '%');
        sound.on("time", function () {
            $(".timeline").css('width', ((sound.currentTime() / sound.options.duration) * 100) + '%');
            $(".timeline_big").css('width', ((sound.currentTime() / sound.options.duration) * 100) + '%');

            $(".footer .current-time").text(moment.utc(sound.currentTime()).format('mm:ss'));
        });

        sound.on("finish", function () {
            if (repeat) {
                playNextSong();
            }
        });




        sound.on("pause", function () {
            $(".controlls .play_song").attr("src", "Images/play.svg");
        });


        sound.on("play-resume", function () {
            $(".controlls .play_song").attr("src", "Images/pause.svg");
        });


        sound.on("play-start", function () {
            if (isFirstPlayBack) {
                $(".controlls .play_song").attr("src", "Images/play.svg");
            } else {
                $(".controlls .play_song").attr("src", "Images/pause.svg");
            }

            if (currentTrack != null) {
                $("#" + currentTrack.id).toggleClass("selected-song");
                $(".track-" + currentTrack.id).toggleClass("selected-song");
                if (!isFirstPlayBack) {

                    $("#" + currentTrack.id + " .add-playlist").css("display", "inline");
                    $("#" + currentTrack.id + " .now-playing").css("display", "none");
                    $(".track-" + currentTrack.id + " .genre").css("display", "inline");
                    $(".track-" + currentTrack.id + " .now-playing").css("display", "none");
                }
            }

            currentTrack = track;
            if (currentTrack != null) {
                $("#" + currentTrack.id).toggleClass("selected-song");
                $(".track-" + currentTrack.id).toggleClass("selected-song");

                if (!isFirstPlayBack) {
                    $("#" + currentTrack.id + " .add-playlist").css("display", "none");
                    $("#" + currentTrack.id + " .now-playing").css("display", "inline");
                    $(".track-" + currentTrack.id + " .genre").css("display", "none");
                    $(".track-" + currentTrack.id + " .now-playing").css("display", "inline");
                }
            }

            var title = track.title;
            if (track.title.length > 50) {
                title = track.title.substring(0, 50) + '...';
            }
            $('.footer .album-cover').removeClass("default-album-cover");
            $('.footer .album-cover').attr("src", track.artwork_url);
            $('.footer .song-title').text(title);
            $('.footer .total-time').text(moment.utc(sound.options.duration).format('mm:ss'));

        });

        $(".controlls .volume-line").click(function (e) {

            UpdateVloume(e, $(this));
        });

        $(".song-timeline").click(function (e) {
            UpdateTimeLine(e, $(this));
        });

        var isDrag = false;

        $('.song-timeline').on('mousedown', function (e) {
            isDrag = true;

            UpdateTimeLine(e, $(this));
        });
        $(document).on('mouseup', function (e) {

            isDrag = false;
        });


        $('.song-timeline').on('mousemove', function (e) {
            if (isDrag) {
                UpdateTimeLine(e, $(this));
            }
        });


        $('.controlls .volume-line').on('mousedown', function (e) {
            isDrag = true;
            UpdateVloume(e, $(this));
        });

        $(document).on('mouseup', function (e) {
            isDrag = false;
        });


        $('.track_volume').on('mousemove', function (e) {
            if (isDrag) {
                UpdateVloume(e, $(this));
            }
        });
    });
}



// get tracks for specefix gener
function getTrack(genre, pageSize) {
    var array = [];
    if (genre == 'Latest 25') {
        genre = '';
    }
    SC.get('/tracks', {
        q: 'remix', genres: genre, created_at: {
            from: moment().subtract(7, 'days').format('YYYY-MM-DD  00:00:01'),
            to: moment().format('YYYY-MM-DD  00:00:01')
        }, limit: pageSize
    }).then(function (tracks) {

        tracks.sort(function (a, b) {
            a = new Date(a.created_at);
            b = new Date(b.created_at);
            return a > b ? -1 : a < b ? 1 : 0;
        });
        listRefreshTime = new Date().getTime();
        var fliteredList = [];
        for (var i = 0; i < tracks.length; i++) {
            var trackDuration = moment.utc(tracks[i].duration).format('mm');
            if (!(trackDuration < 2 || trackDuration > 10)) {

                fliteredList.push(tracks[i]);
            }
        }
        tracks = fliteredList;
        var length = tracks.length;
        if (length > 25) {
            length = 25;
        }

        $('.mid-list').hide();
        for (var i = 0; i < length; i++) {
            trackList.push(tracks[i]);
            var title = tracks[i].title;
            if (tracks[i].title.length > 80) {
                title = tracks[i].title.substring(0, 80) + '...';
            }
            var selectedClass = 'selected-genre';
            var text = 'Added';
            var result = getTrackFromPlayListByid(tracks[i].id);
            if (result == null) {
                selectedClass = '';
                var text = 'Add to playlist';
            }

            if (tracks[i].artwork_url == null) {
                tracks[i].artwork_url = 'Images/favicon.png';
            }
            var songRow = ' <div id="' + tracks[i].id + '" class="row song"> <div class="col-lg-1 song-number">' + trackList.length + '</div>' +
                '<div class="col-lg-7 song-info" > <img src="' + tracks[i].artwork_url + '" width="48" height="48" class="album-cover">' +
                '<div class="album-cover-overlay hide-overlay"><img width=16 alt="play" src="Images/play.svg" ></div>' +
                '<span class="song-title">' + title + '</span> </div>' +
                '<div class="col-lg-3 add-playlist"> <div class="genre ' + selectedClass + '"><span class="text">' + text + '</span><img class="genre-image" src="Images/tick.svg" width="17" height="13"> </div></div>' +
                '<div class="col-lg-3 now-playing">Now playing <span class="rectangle-1"></span><span class="rectangle-2"></span><span class="rectangle-3"></span></div>' +
                '<div class="col-lg-2 play-count"><span><img style="margin-right: 5px;margin-bottom: 2px;" width="8px" src="Images/small-play.svg"></span><span>' + tracks[i].likes_count + ' / ' + tracks[i].playback_count + '</span> </div></div>'

            if ($(window).width() < 768 && i <= 15) {
                $('.trackList').eq(0).append(songRow);
            } else if ($(window).width() < 768 && i > 15) {
                $('.mid-list').show();
                $('.trackList').eq(1).append(songRow);
            } else {
                $('.trackList').eq(0).append(songRow);

            }
        }
    });

}

function UpdateTimeLine(e, thisObj) {

    var x = e.pageX - thisObj.offset().left;
    var width = $('.song-timeline').width();
    var duration = player.options.duration;
    player.seek((x / width) * duration);
}


function UpdateVloume(e, thisObj) {

    var x = e.pageX - thisObj.offset().left;
    var width = $('.controlls .volume-line').width();
    var maxVolume = 1;
    player.setVolume((x / width) * maxVolume);
    $(".track_volume").css('width', ((player.getVolume() / 1) * 100) + '%');


}

function getTrackForSearchResult(query) {
    query = query + ' remix';
    var array = [];
    SC.get('/tracks', {
        q: query
    }).then(function (tracks) {
        searchList = [];
        $('.search_result').text("");
        for (var i = 0; i < tracks.length; i++) {
            searchList.push(tracks[i]);
            var index = i;
            var title = tracks[i].title;
            if (tracks[i].title.length > 50) {
                title = tracks[i].title.substring(0, 50) + '...';
            }
            var selectedClass = 'selected-genre';
            var result = getTrackFromPlayListByid(tracks[i].id);
            if (result == null) {
                selectedClass = '';
            }
            if (tracks[i].artwork_url == null) {
                tracks[i].artwork_url = 'Images/favicon.png';
            }
            var songRow = ' <div id="' + tracks[i].id + '" class="row song"> <div class="col-lg-1 song-number">' + ++index + '</div>' +
                '<div class="col-lg-7 song-info" > <img src="' + tracks[i].artwork_url + '" width="48" height="48" class="album-cover">' +
                '<div class="album-cover-overlay hide-overlay"><img width=16 alt="play" src="Images/play.svg" ></div>' +
                '<span class="song-title">' + title + '</span> </div>' +
                '<div class="col-lg-3 add-playlist"> <div class="genre ' + selectedClass + '"><span class="text">Add to playlist</span><img class="genre-image" src="Images/ tick.svg" width="17" height="13"> </div></div>' +
                '<div class="col-lg-3 now-playing">Now playing <span class="rectangle-1"></span><span class="rectangle-2"></span><span class="rectangle-3"></span></div>' +
                '<div class="col-lg-2 play-count"><span><img style="margin-right: 5px;margin-bottom: 2px;" width="8px" src="Images/small-play.svg"></span><span>' + tracks[i].likes_count + ' /' + tracks[i].playback_count + '</span> </div></div>'

            $('.search_result').append(songRow);
        }
    });
}












