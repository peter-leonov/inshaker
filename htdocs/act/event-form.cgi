#!/usr/bin/perl

use strict;
# use utf8;
use CGI::Minimal;
use MIME::Lite;
use MIME::EncWords qw(:all);
use MIME::Base64;
use Encode qw(encode);

my $cgi = CGI::Minimal->new;
my $q = {map { $_, $cgi->param($_) } $cgi->param};

my $msg = MIME::Lite->new
(
	From    => encode_mimewords($q->{first} . ' ' . $q->{second} . ' <' . $q->{email} . '>'),
	To      => 'event@inshaker.ru, pl@contactmaker.ru',
	Subject =>  encode_mimewords($q->{event}, Charset => 'UTF-8'),
	Type    => 'multipart/mixed'
);

my $html = '<table><tr><td>aaa</td><td>aaa1</td><td>aaa2</td></tr></table>';

$msg->attach
(
	Type     => 'text/html; charset=utf-8',
	Encoding => 'base64',
	Data     =>  $html
);
$msg->attr('X-HTTP-User-Agent' => $ENV{HTTP_USER_AGENT});
$msg->attr('X-Http-Remote-Addr' => $ENV{HTTP_X_FORWARDED_FOR} || $ENV{HTTP_X_REAL_IP} || $ENV{REMOTE_ADDR});

$msg->send;

print "Content-type: application/json\n\n";
print '{"result": "OK", "id": 1}';
