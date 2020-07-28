# Opening master

Wanna play? [opening-master.herokuapp.com](https://opening-master.herokuapp.com/)

## Description

The idea for this app was born when YouTube recommended me anime openings quiz. 
I didn't know some of the ones marked as easy (because I didn't watch these animes) 
but I knew a bunch of openings marked as hard. I came to conclusion that there are 
no easy and hard ones, there are those you have listened to and the rest. Then I 
created this app that knows what you have watched and makes a personalized quiz. 
After half a year, I came across a weeb Discord bot. One of its features was 
a waifu quiz. No one was able to guess anything because the quiz wasn't personalized. 
However, a personalized anime character quiz would be a great idea, so I added 
such a quiz to this app. Now I can't guess the characters I should know.

## Requirements

`KEY` environmental variable - Youtube Data API key

## Example of a supported XML file

```xml
<myanimelist>
    <anime>
        <series_animedb_id>30276</series_animedb_id>
        <series_title>One Punch Man</series_title>
        <series_type>TV</series_type>
        <my_status>Completed</my_status>
    </anime>
    <anime>
        <series_animedb_id>32615</series_animedb_id>
        <series_title>Youjo Senki</series_title>
        <series_type>TV</series_type>
        <my_status>Watching</my_status>
    </anime>
    <anime>
        <series_animedb_id>32281</series_animedb_id>
        <series_title>Kimi no Na wa.</series_title>
        <series_type>Movie</series_type>
        <my_status>Completed</my_status>
    </anime>
</myanimelist>
```

