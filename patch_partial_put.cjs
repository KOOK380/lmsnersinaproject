const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');

// Event PUT
content = content.replace(
  /const \{ title, description, date, endDate, expiryDate, totalSeats, availableSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes, notifyEnrolled, isActive \} = req\.body;\n\s*const event = await prisma\.event\.update\(\{\n\s*where: \{ id: req\.params\.id \},\n\s*data: \{\n\s*isActive: isActive !== undefined \? isActive : true,\n\s*title, description, date: new Date\(date\),\n\s*endDate: endDate \? new Date\(endDate\) : null,\n\s*expiryDate: expiryDate \? new Date\(expiryDate\) : null,\n\s*totalSeats: totalSeats \? parseInt\(totalSeats\) : 0,\n\s*availableSeats: availableSeats !== undefined \? parseInt\(availableSeats\) : undefined,\n\s*price: parseFloat\(price\),\n\s*realPrice: realPrice !== undefined && realPrice !== null \? parseFloat\(realPrice\) : null,\n\s*location, imageUrl,\n\s*meetingLink, meetingDate: meetingDate \? new Date\(meetingDate\) : null, meetingNotes\n\s*\}\n\s*\}\);/g,
  `const { title, description, date, endDate, expiryDate, totalSeats, availableSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes, notifyEnrolled, isActive } = req.body;
  const updateData: any = {};
  if (isActive !== undefined) updateData.isActive = isActive;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (date !== undefined) updateData.date = new Date(date);
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
  if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
  if (totalSeats !== undefined) updateData.totalSeats = parseInt(totalSeats);
  if (availableSeats !== undefined) updateData.availableSeats = parseInt(availableSeats);
  if (price !== undefined) updateData.price = parseFloat(price);
  if (realPrice !== undefined) updateData.realPrice = realPrice !== null ? parseFloat(realPrice) : null;
  if (location !== undefined) updateData.location = location;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
  if (meetingDate !== undefined) updateData.meetingDate = meetingDate ? new Date(meetingDate) : null;
  if (meetingNotes !== undefined) updateData.meetingNotes = meetingNotes;
  
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: updateData
  });`
);

// Membership PUT
content = content.replace(
  /const \{ contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate, notifyEnrolled, enablePlatformContent, telegramLink, whatsappLink, customExternalLink, isActive \} = req\.body;\n\s*let parsedCategoryId = categoryId === '' \? null : categoryId;\n\s*const membership = await prisma\.membership\.update\(\{\n\s*where: \{ id: req\.params\.id \},\n\s*data: \{\n\s*isActive: isActive !== undefined \? isActive : true,\n\s*type, label, offerPrice, realPrice, imageUrl, categoryId: parsedCategoryId,\n\s*expiryDate: expiryDate \? new Date\(expiryDate\) : null,\n\s*meetingLink, meetingDate: meetingDate \? new Date\(meetingDate\) : null, meetingNotes, enablePlatformContent: enablePlatformContent \?\? true, telegramLink, whatsappLink, customExternalLink\n\s*\}\n\s*\}\);/g,
  `const { contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate, notifyEnrolled, enablePlatformContent, telegramLink, whatsappLink, customExternalLink, isActive, isSubscription, subscriptionInterval } = req.body;
    
    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (type !== undefined) updateData.type = type;
    if (label !== undefined) updateData.label = label;
    if (offerPrice !== undefined) updateData.offerPrice = offerPrice;
    if (realPrice !== undefined) updateData.realPrice = realPrice;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (categoryId !== undefined) updateData.categoryId = categoryId === '' ? null : categoryId;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (meetingDate !== undefined) updateData.meetingDate = meetingDate ? new Date(meetingDate) : null;
    if (meetingNotes !== undefined) updateData.meetingNotes = meetingNotes;
    if (enablePlatformContent !== undefined) updateData.enablePlatformContent = enablePlatformContent;
    if (telegramLink !== undefined) updateData.telegramLink = telegramLink;
    if (whatsappLink !== undefined) updateData.whatsappLink = whatsappLink;
    if (customExternalLink !== undefined) updateData.customExternalLink = customExternalLink;
    if (isSubscription !== undefined) updateData.isSubscription = isSubscription;
    if (subscriptionInterval !== undefined) updateData.subscriptionInterval = subscriptionInterval;

    const membership = await prisma.membership.update({ 
      where: { id: req.params.id }, 
      data: updateData
    });`
);

fs.writeFileSync('src/api.ts', content);
