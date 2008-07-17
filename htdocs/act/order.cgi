#!/usr/bin/perl

# use utf8;
use CGI::Minimal;
use MIME::Lite;
use MIME::EncWords qw(:all);
use MIME::Base64;
use Encode qw(encode);

my $cgi = CGI::Minimal->new;
my $q = {};
map { $q->{$_} = $cgi->param($_) } $cgi->param;

$msg = MIME::Lite->new
(
	From    => 'mail@inshaker.ru',
	To      => 'mail@inshaker.ru, '.$q->{email}.', '.$q->{add_email},
	Subject =>  encode_mimewords($q->{order_type}, Charset => 'UTF-8'),
	Type    => 'multipart/mixed'
);

$msg->attach
(
	Type     => 'text/html; charset=utf-8',
	Encoding => 'base64',
	Data     =>  $q->{html}
);
$msg->attr('X-HTTP-User-Agent' => $ENV{HTTP_USER_AGENT});
$msg->attr('X-Http-Remote-Addr' => $ENV{HTTP_X_FORWARDED_FOR} || $ENV{HTTP_X_REAL_IP} || $ENV{REMOTE_ADDR});

$msg->send;

print "Content-type: application/javascript\n\n[]";
