#!/bin/bash
cd als_ow_client
npm run build
cd ..
rsync -avz als_ow_client /Volumes/John/Webstormprojects/
