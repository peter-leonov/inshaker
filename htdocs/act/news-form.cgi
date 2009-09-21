#!/usr/bin/perl
sleep 1;
use strict;
# use utf8;
use CGI::Minimal;
use MIME::Lite;
use MIME::EncWords qw(:all);
use MIME::Base64;
use Encode qw(encode);
use Text::CSV_XS;

my $cgi = CGI::Minimal->new;
my $q = {map { $_, $cgi->param($_) } $cgi->param};

my $signature = $q->{first} . ' [' . $q->{city} . ']';

my $msg = MIME::Lite->new
(
	From    => encode_mimewords($signature . ' <' . $q->{email} . '>', Charset => 'UTF-8'),
	To      => 'mail@inshaker.ru, pl@contactmaker.ru',
	Subject =>  encode_mimewords($q->{event}, Charset => 'UTF-8'),
	Type    => 'multipart/mixed'
);


my @names = qw(Имя Город E-mail);
my @values = ($q->{first}, $q->{city}, $q->{email});
my $human = '';

my $row1 = join('', map { "<th>$_</th>" } @names);
my $row2 = join('', map { "<td>$_</td>" } @values);

open my $table, '>>', "../../data/news-subscribers.csv";
my $csv = Text::CSV_XS->new({ binary => 1, eol => $/ });
$csv->combine(scalar localtime, $q->{event}, @values);
print $table $csv->string;
close $table;


my $html = qq { <h1>$signature</h1> <br> <table border="1" cellspacing="0" cellpadding="2"><tr>$row1</tr><tr>$row2</tr></table> <br><br> <table>$human</table> };

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
