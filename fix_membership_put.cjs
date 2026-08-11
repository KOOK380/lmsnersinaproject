const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');

const regex = /const \{ contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate, notifyEnrolled, enablePlatformContent, telegramLink, whatsappLink, customExternalLink(?:, isActive)? \} = req\.body;\s*let parsedCategoryId = categoryId === '' \? null : categoryId;\s*const membership = await prisma\.membership\.update\(\{\s*where: \{ id: req\.params\.id \},\s*data: \{[\s\S]*?\}\s*\}\);/m;

const replacement = `const { contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate, notifyEnrolled, enablePlatformContent, telegramLink, whatsappLink, customExternalLink, isActive, isSubscription, subscriptionInterval } = req.body;
    
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
    });`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/api.ts', content);
