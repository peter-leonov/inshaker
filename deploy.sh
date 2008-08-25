#!/bin/bash

echo "Adding cocktails html files..."
svn add htdocs/cocktails/* 2>&1 | grep "A         "
echo "Adding images for cocktails..."
svn add htdocs/i/cocktail/b/* 2>&1 | grep "A         "
svn add htdocs/i/cocktail/bg/* 2>&1 | grep "A         "
svn add htdocs/i/cocktail/print/* 2>&1 | grep "A         "
svn add htdocs/i/cocktail/s/* 2>&1 | grep "A         "
echo "Adding merchandise..."
svn add htdocs/i/merchandise/banners/* 2>&1 | grep "A         "
svn add htdocs/i/merchandise/ingredients/* 2>&1 | grep "A         "
svn add htdocs/i/merchandise/ingredients/print/* 2>&1 | grep "A         "
svn add htdocs/i/merchandise/tools/* 2>&1 | grep "A         "
svn add htdocs/i/merchandise/volumes/* 2>&1 | grep "A         "
echo "Adding bars..."
svn add htdocs/bars/* 2>&1 | grep "A         "
svn add htdocs/i/bar/* 2>&1 | grep "A         "
echo "The following files will be updated:"
svn st | grep "M      "
svn ci -m "content update" --username vaskas --password 67d64a2cf1a6 2>&1 | grep "Committed "

echo 'Connecting to inshaker.ru...'
ssh root@inshaker.ru 'cd /www && sudo -u www svn up 2>&1 | grep revision'