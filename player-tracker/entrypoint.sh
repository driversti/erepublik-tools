#!/bin/sh

# Adjust permissions
chown -R nobody:nogroup /app/data

#EXPORT TZ=America/Los_Angeles

# Start the application
exec node bundle.js
