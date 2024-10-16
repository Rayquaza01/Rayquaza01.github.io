---
layout: post
title: Picotron pretty_printh and ANSI Codes for Colored Logs
date: 2024-10-16
tags:
    - picotron
    - programming
    - software
---

This isn't a Picotron specific thing, but you can use ANSI escape codes inside printh to make your logs colorful, which can be helpful with debugging.

{% include 'picture.html', src: "/assets/images/blog/pretty-printh-demo.png", alt: "A demo of Pretty Printh" %}

To set the color, typically you do `\033[38;5;<COLOR>m` or `\033[38;2;<RED>;<GREEN>;<BLUE>m`. This sets the foreground color to a color from this chart or an RGB color code (if your terminal [supports truecolor](https://github.com/termstandard/colors)).

This just works in Picotron, but you have to do `\27` instead of `\033`. (This is the escape code for ESC, which is 27 in decimal and 033 in octal.)

However, writing ANSI codes by hand is a pain, so I wrote a function to make inserting these codes easier, using a bbcode-like syntax.

* Foreground color can be set with `[fg=1][/fg]` or `[fg=#ff0000][/fg]`
* Background color can be set with `[bg=1][/bg]` or `[bg=#ff0000][/bg]`
* Bold can be set with `[b][/b]`
* Italics can be set with `[i][/i]`
* Underline can be set with `[u][/u]`

```lua
function pretty_printh(s)
	s = s
		:gsub("%[fg=(#?%w+)]", function (c)
			if c:find("^%d+$") then
				return string.format("\27[38;5;%sm", c)
			end

			if c:find("^#[%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F]$") then
				return string.format(
					"\27[38;2;%d;%d;%dm",
					tonum("0x" .. c:sub(2, 3)),
					tonum("0x" .. c:sub(4, 5)),
					tonum("0x" .. c:sub(6, 7))
				)
			end
		end)
		:gsub("%[/fg]", "\27[39m")
		:gsub("%[bg=(#?%w+)]", function (c)
			if c:find("^%d+$") then
				return string.format("\27[48;5;%sm", c)
			end

			if c:find("^#[%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F]$") then
				return string.format(
					"\27[48;2;%d;%d;%dm",
					tonum("0x" .. c:sub(2, 3)),
					tonum("0x" .. c:sub(4, 5)),
					tonum("0x" .. c:sub(6, 7))
				)
			end
		end)
		:gsub("%[/bg]", "\27[49m")
		:gsub("%[u]", "\27[4m")
		:gsub("%[/u]", "\27[24m")
		:gsub("%[b]", "\27[1m")
		:gsub("%[/b]", "\27[22m")
		:gsub("%[i]", "\27[3m")
		:gsub("%[/i]", "\27[23m")

	printh(s .. "\27[0m")
end

function error(msg)
	pretty_printh("[fg=1][b][ERROR][/b][/fg]: " .. msg)
end

function warn(msg)
	pretty_printh("[fg=3][b][WARNING][/b][/fg]: " .. msg)
end

function info(msg)
	pretty_printh("[fg=4][b][INFO][/b][/fg]: " .. msg)
end
```

Here's the code that I used to get the example in the screenshot:

```lua
function left_pad(s, ch, len)
	while #s < len do
		s = ch .. s
	end

	return s
end

function _init()
	pretty_printh("[fg=6][b][u]Pretty Printh Demo[/u][/b][/fg]")

	for i = 0, 15, 4 do
		str = string.format(
			"[fg=%d]color %s[/fg]\t[fg=%d]color %s[/fg]\t[fg=%d]color %s[/fg]\t[fg=%d]color %s[/fg]",
			i, left_pad(tostr(i), "0", 2),
			i + 1, left_pad(tostr(i + 1), "0", 2),
			i + 2, left_pad(tostr(i + 2), "0", 2),
			i + 3, left_pad(tostr(i + 3), "0", 2)
		)

		pretty_printh(str)
	end

	error("this is an error")
	warn("this is a warning")
	info("this is informative")

	pretty_printh("this is a line with [b]bold[/b], [i]italics[/i], and [u]underlines[/u]")

	pretty_printh("[bg=#ffffff][fg=#241f31]this is a line with hex colors[/fg][/bg]")
end
```

This post was originally posted [on the Picotron BBS](https://www.lexaloffle.com/bbs/?tid=144691). The code for `pretty_printh` can also be found [at this gist](https://gist.github.com/Rayquaza01/2d8fed846362775168b0fd6153e875ba).
